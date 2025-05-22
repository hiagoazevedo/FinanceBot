const moment = require('moment');

class DateService {
  static getPeriodDates(period) {
    switch (period.toLowerCase()) {
      case 'semanal':
        return {
          startDate: moment().subtract(7, 'days').startOf('day').toDate(),
          endDate: moment().endOf('day').toDate()
        };
      case 'anual':
        return {
          startDate: moment().startOf('year').toDate(),
          endDate: moment().endOf('year').toDate()
        };
      case 'mensal':
      default:
        return {
          startDate: moment().startOf('month').toDate(),
          endDate: moment().endOf('month').toDate()
        };
    }
  }

  static formatDate(date) {
    return moment(date).format('DD/MM/YYYY');
  }

  static formatDateTime(date) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  }

  static getDaysInPeriod(startDate, endDate) {
    return moment(endDate).diff(moment(startDate), 'days') + 1;
  }

  static getLastThreeMonths() {
    const endDate = moment().endOf('month').toDate();
    const startDate = moment().subtract(2, 'months').startOf('month').toDate();
    return { startDate, endDate };
  }
}

module.exports = DateService; 