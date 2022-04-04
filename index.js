'use strict'

/* C */
var Moment = require('moment')
/* C */
var KOCString = require('koc-common-string')

/* C */
var KOCDatetime = {
  Moment: Moment,
  /********************************
   * Valid 判断是否为有效时间
   ********************************/
  Valid: function (Value) {
    return !!KOCDatetime.Object(Value)
  },
  /********************************
   * Object 取得时间对像(Moment)
   ********************************/
  Object: function (Value) {
    if (Moment.isMoment(Value)) {
      return Value
    }
    Value = Moment(Value, [
      Moment.ISO_8601,
      'YYYY-MM-DD HH:mm:ss.SSS',
      'YYYY/MM/DD HH:mm:ss.SSS',
      'YYYY.MM.DD HH:mm:ss.SSS',
      'YYYY-MM-DD',
      'YYYY/MM/DD',
      'YYYY.MM.DD',
      'YY-MM-DD HH:mm:ss.SSS',
      'YY/MM/DD HH:mm:ss.SSS',
      'YY.MM.DD HH:mm:ss.SSS',
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY/MM/DDTHH:mm:ss',
      'YYYY.MM.DDTHH:mm:ss',
      'YY-MM-DDTHH:mm:ss',
      'YY/MM/DDTHH:mm:ss',
      'YY.MM.DDTHH:mm:ss'
    ])
    return Value.isValid() ? Value : null
  },
  /********************************
   * PreciseRange 取得时间差值
   ********************************/
  PreciseRange: function (ValueBegin, ValueEnd) {
    ValueBegin = KOCDatetime.Object(ValueBegin)
    if (!ValueBegin) {
      return null
    }
    ValueEnd = KOCDatetime.Object(ValueEnd) || Moment()
    /* L */
    var IsAfter = true
    if (ValueBegin.isAfter(ValueEnd)) {
      /* C */
      var tmp = ValueBegin
      ValueBegin = ValueEnd
      ValueEnd = tmp
      IsAfter = false
    }
    /* L */
    var yDiff = ValueEnd.year() - ValueBegin.year()
    /* L */
    var mDiff = ValueEnd.month() - ValueBegin.month()
    /* L */
    var dDiff = ValueEnd.date() - ValueBegin.date()
    /* L */
    var hourDiff = ValueEnd.hour() - ValueBegin.hour()
    /* L */
    var minDiff = ValueEnd.minute() - ValueBegin.minute()
    /* L */
    var secDiff = ValueEnd.second() - ValueBegin.second()
    if (secDiff < 0) {
      secDiff = 60 + secDiff
      minDiff--
    }
    if (minDiff < 0) {
      minDiff = 60 + minDiff
      hourDiff--
    }
    if (hourDiff < 0) {
      hourDiff = 24 + hourDiff
      dDiff--
    }
    if (dDiff < 0) {
      /* C */
      var daysInLastFullMonth = Moment(ValueEnd.year() + '-' + (ValueEnd.month() + 1), 'YYYY-MM').subtract(1, 'months').daysInMonth()
      if (daysInLastFullMonth < ValueBegin.date()) { // 31/01 -> 2/03
        dDiff = daysInLastFullMonth + dDiff + (ValueBegin.date() - daysInLastFullMonth)
      } else {
        dDiff = daysInLastFullMonth + dDiff
      }
      mDiff--
    }
    if (mDiff < 0) {
      mDiff = 12 + mDiff
      yDiff--
    }
    var retData = {
      Years: Moment.duration(yDiff, 'year').asYears(),
      Months: Moment.duration(mDiff, 'month').asMonths(),
      Days: Moment.duration(dDiff, 'day').asDays(),
      Hours: Moment.duration(hourDiff, 'hour').asHours(),
      Minutes: Moment.duration(minDiff, 'minute').asMinutes(),
      Seconds: Moment.duration(secDiff, 'second').asSeconds(),
      SecondsDiff: { // 以秒计算时差
        Total: parseInt(Moment.duration(ValueEnd.diff(ValueBegin)).asSeconds()), // 总计相差秒
        Hours: 0,
        Minutes: 0,
        Seconds: 0
      },
      After: IsAfter,
      Data: []
    }
    retData.SecondsDiff.Seconds = retData.SecondsDiff.Total
    retData.SecondsDiff.Hours = parseInt(retData.SecondsDiff.Total / 3600)
    retData.SecondsDiff.Seconds -= parseInt(retData.SecondsDiff.Hours * 3600)
    retData.SecondsDiff.Minutes = parseInt(retData.SecondsDiff.Seconds / 60)
    retData.SecondsDiff.Seconds -= parseInt(retData.SecondsDiff.Minutes * 60)
    var dataBegin = false
    if (retData.Years) {
      retData.Data.push({
        Type: 'Years',
        Value: retData.Years,
        Text: '年'
      })
      dataBegin = true
    }
    if (dataBegin || retData.Months) {
      retData.Data.push({
        Type: 'Months',
        Value: retData.Months,
        Text: '月'
      })
      dataBegin = true
    }
    if (dataBegin || retData.Days) {
      retData.Data.push({
        Type: 'Days',
        Value: retData.Days,
        Text: '天'
      })
      dataBegin = true
    }
    if (dataBegin || retData.Hours) {
      retData.Data.push({
        Type: 'Hours',
        Value: retData.Hours,
        Text: '小时'
      })
      dataBegin = true
    }
    if (dataBegin || retData.Minutes) {
      retData.Data.push({
        Type: 'Minutes',
        Value: retData.Minutes,
        Text: '分'
      })
      dataBegin = true
    }
    if (dataBegin || retData.Seconds) {
      retData.Data.push({
        Type: 'Seconds',
        Value: retData.Seconds,
        Text: '秒'
      })
    }
    return retData
  },
  /********************************
   * PreciseRangeText 取得时间差值文字(小时、分、秒)
   ********************************/
  // {
  //   Begin: 开始时间,
  //   End: 结束时间, // undefined:当前时间
  //   Chinese: 是否中文描述 xx小时xx分xx秒 / xx:xx:xx
  // }
  PreciseRangeTimeText: function (val) {
    var Value = KOCDatetime.PreciseRange(val.Begin, val.End)
    if (!Value) {
      return null
    }
    return (Value.SecondsDiff.Hours >= 10 ? '' : '0') + Value.SecondsDiff.Hours + (val.Chinese ? '小时' : ':') + (Value.SecondsDiff.Minutes >= 10 ? '' : '0') + Value.SecondsDiff.Minutes + (val.Chinese ? '分' : ':') + (Value.SecondsDiff.Seconds >= 10 ? '' : '0') + Value.SecondsDiff.Seconds + (val.Chinese ? '秒' : '')
  },
  /********************************
   * PreciseRangeText 取得时间差值文字
   ********************************/
  // {
  //   Begin: 开始时间,
  //   End: 结束时间, // undefined:当前时间
  //   Num: 精度 // 从大到小,
  //   Desc: 是否需要描述 // 之前 or 之后
  // }
  PreciseRangeText: function (val) {
    /* C */
    var Value = KOCDatetime.PreciseRange(val.Begin, val.End)
    if (!Value) {
      return ''
    }
    val.Num = KOCString.ToInt(val.Num, -1)
    /* L */
    var Text = ''
    /* L */
    var Space = false
    if (val.Num !== 0 && Value.Years) {
      Text += Value.Years + '年'
      val.Num--
    }
    if (val.Num !== 0) {
      if (Value.Months) {
        Text += Value.Months + '个月'
        val.Num--
      } else if (Text) {
        Space = true
        val.Num--
      }
    }
    if (val.Num !== 0) {
      if (Value.Days) {
        Text += (Space ? ' 零 ' : '') + Value.Days + '天'
        Space = false
        val.Num--
      } else if (Text) {
        Space = true
        val.Num--
      }
    }
    if (val.Num !== 0) {
      if (Value.Hours) {
        Text += (Space ? ' 零 ' : '') + Value.Hours + '小时'
        Space = false
        val.Num--
      } else if (Text) {
        Space = true
        val.Num--
      }
    }
    var minutesText = ''
    if (val.Num !== 0) {
      if (Value.Minutes) {
        !Text && (minutesText = '钟')
        Text += (Space ? ' 零 ' : '') + Value.Minutes + '分'
        Space = false
        val.Num--
      } else if (Text) {
        Space = true
        val.Num--
      }
    }
    if (val.Num !== 0 && Value.Seconds) {
      Text += (Space ? ' 零 ' : '') + Value.Seconds + '秒'
    } else {
      Text += minutesText
    }
    val.Desc && (Text = Text ? (Text + ' ' + (Value.After ? '以前' : '以后')) : '刚刚')
    return Text
  },
  /********************************
   * Min 取得最小时间(Moment)
   * Format     是否格式化 默认:true false:不格式化(输出Moment对像) true:格式化 其它:格式化格式
   ********************************/
  Min: function (Value, Format) {
    Value = KOCDatetime.Info(Value)
    if (!Value) {
      return null
    }
    Value.month = Value.month > 0 ? Value.month : 1
    Value.day = Value.day > 0 ? Value.day : 1
    Value.hour = Value.hour >= 0 ? Value.hour : 0
    Value.minute = Value.minute >= 0 ? Value.minute : 0
    Value.second = Value.second >= 0 ? Value.second : 0
    Value.millisecond = Value.millisecond >= 0 ? Value.millisecond : 0
    Value = KOCDatetime.Object(Value.year + '-' + Value.month + '-' + Value.day + ' ' + Value.hour + ':' + Value.minute + ':' + Value.second + '.' + Value.millisecond)
    if (Format !== false) {
      Value = Value.format(typeof Format === 'string' ? Format : 'YYYY-MM-DD HH:mm:ss.SSS')
    }
    return Value
  },
  /********************************
   * Max 取得最大时间(Moment)
   * Format     是否格式化 默认:true false:不格式化(输出Moment对像) true:格式化 其它:格式化格式
   ********************************/
  Max: function (Value, Format) {
    Value = KOCDatetime.Info(Value)
    if (!Value) {
      return null
    }
    Value.month = Value.month > 0 ? Value.month : 12
    Value.day = Value.day > 0 ? Value.day : KOCString.ToInt(KOCDatetime.Object(Value.year + '-' + Value.month).endOf('month').format('DD'))
    Value.hour = Value.hour >= 0 ? Value.hour : 23
    Value.minute = Value.minute >= 0 ? Value.minute : 59
    Value.second = Value.second >= 0 ? Value.second : 59
    Value.millisecond = Value.millisecond >= 0 ? Value.millisecond : 999
    Value = KOCDatetime.Object(Value.year + '-' + Value.month + '-' + Value.day + ' ' + Value.hour + ':' + Value.minute + ':' + Value.second + '.' + Value.millisecond)
    if (Format !== false) {
      Value = Value.format(typeof Format === 'string' ? Format : 'YYYY-MM-DD HH:mm:ss.SSS')
    }
    return Value
  },
  /********************************
   * Info 取得时间详细信息
   ********************************/
  Info: function (Value) {
    if (Moment.isMoment(Value)) Value = Value.format('YYYY-MM-DD HH:mm:ss')
    if (!Value) return null
    /* C */
    var _Date = {
      year: -1,
      month: -1,
      day: -1,
      hour: -1,
      minute: -1,
      second: -1,
      millisecond: -1
    }
    Value = Value.split(' ')
    if (Value.length > 1) {
      /* C */
      var _ValueTime = Value[1].split(':')
      if (_ValueTime.length > 2) {
        /* C */
        var _ValueTimeSecond = _ValueTime[2].split('.')
        if (_ValueTimeSecond > 1) {
          _Date.millisecond = KOCString.ToInt(_ValueTimeSecond[1], -1)
        }
        _Date.second = KOCString.ToInt(_ValueTimeSecond[0], -1)
      }
      if (_ValueTime.length > 1) {
        _Date.minute = KOCString.ToInt(_ValueTime[1], -1)
      }
      _Date.hour = KOCString.ToInt(_ValueTime[0], -1)
    }
    /* L */
    var _ValueDate = [Value[0]]
    if (Value[0].indexOf('-') > 0) {
      _ValueDate = Value[0].split('-')
    } else if (Value[0].indexOf('/') > 0) {
      _ValueDate = Value[0].split('/')
    } else if (Value[0].indexOf('.') > 0) {
      _ValueDate = Value[0].split('.')
    }
    if (_ValueDate.length > 2) {
      _Date.day = KOCString.ToInt(_ValueDate[2], -1)
    }
    if (_ValueDate.length > 1) {
      _Date.month = KOCString.ToInt(_ValueDate[1], -1)
    }
    _Date.year = KOCString.ToInt(_ValueDate[0], -1)
    if (_Date.year < 0) {
      _Date.month = -1
    }
    if (_Date.month <= 0) {
      _Date.day = -1
    }
    if (_Date.day <= 0) {
      _Date.hour = -1
    }
    if (_Date.hour < 0) {
      _Date.minute = -1
    }
    if (_Date.minute < 0) {
      _Date.second = -1
    }
    if (_Date.second < 0) {
      _Date.millisecond = -1
    }
    return _Date
  },
  /********************************
   * Range 取得时间区间
   * Day-N:今天
   * Day-1:昨天
   * Day-2:前天
   * Week-N:本周
   * Week-1:上周
   * Week-1-N:上周-本周
   * Month-N:本月
   * Month-1:上月
   * Month-1-N:上月-本月
   * Quarter-N:本季度
   * Quarter-1:上季度
   * Year-N:今年
   * Year-1:去年
   * Year-2:前年
   ********************************/
  Range: function (type) {
    var _Date = {
      Begin: null,
      BeginString: null,
      End: null,
      EndString: null
    }
    switch (type) {
      default:
      case 'Day-N':
        _Date.Begin = Moment()
        _Date.End = Moment()
        break
      case 'Day-1':
        _Date.Begin = Moment().add(-1, 'day')
        _Date.End = Moment().add(-1, 'day')
        break
      case 'Day-2':
        _Date.Begin = Moment().add(-2, 'day')
        _Date.End = Moment().add(-2, 'day')
        break
      case 'Week-N':
        _Date.Begin = Moment().startOf('isoWeek')
        _Date.End = Moment().endOf('isoWeek')
        break
      case 'Week-1':
        _Date.Begin = Moment().add(-1, 'week').startOf('isoWeek')
        _Date.End = Moment().add(-1, 'week').endOf('isoWeek')
        break
      case 'Week-1-N':
        _Date.Begin = Moment().add(-1, 'week').startOf('isoWeek')
        _Date.End = Moment().endOf('isoWeek')
        break
      case 'Month-N':
        _Date.Begin = Moment().startOf('month')
        _Date.End = Moment().endOf('month')
        break
      case 'Month-1':
        _Date.Begin = Moment().add(-1, 'month').startOf('month')
        _Date.End = Moment().add(-1, 'month').endOf('month')
        break
      case 'Month-1-N':
        _Date.Begin = Moment().add(-1, 'month').startOf('month')
        _Date.End = Moment().endOf('month')
        break
      case 'Quarter-N':
        _Date.Begin = Moment().startOf('quarter')
        _Date.End = Moment().endOf('quarter')
        break
      case 'Quarter-1':
        _Date.Begin = Moment().add(-1, 'quarter').startOf('quarter')
        _Date.End = Moment().add(-1, 'quarter').endOf('quarter')
        break
      case 'Year-N':
        _Date.Begin = Moment().startOf('year')
        _Date.End = Moment().endOf('year')
        break
      case 'Year-1':
        _Date.Begin = Moment().add(-1, 'year').startOf('year')
        _Date.End = Moment().add(-1, 'year').endOf('year')
        break
      case 'Year-2':
        _Date.Begin = Moment().add(-2, 'year').startOf('year')
        _Date.End = Moment().add(-2, 'year').endOf('year')
        break
    }
    _Date.Begin = KOCDatetime.Min(_Date.Begin, false)
    _Date.BeginString = _Date.Begin.format('YYYY-MM-DD HH:mm:ss')
    _Date.End = KOCDatetime.Min(_Date.End, false)
    _Date.EndString = _Date.End.format('YYYY-MM-DD HH:mm:ss')
    return _Date
  }
}
Moment = require('moment')
if ('default' in Moment) {
  KOCDatetime.Moment = Moment['default']
}
module.exports = KOCDatetime