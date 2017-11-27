import * as moment from 'moment';

// TODO: ServiceId, TocCode, Station be their own classes?
export type TimeOnly = moment.Moment;
export type DateOnly = moment.Moment;

/**
 * @brief      Base class for handling hsp api data.
 */
export class HspApiData {
    /**
     * @brief      Parse a time string to a Date object
     *
     * @param      timeText  The time text
     *
     * @return     A Date object
     */
    protected toTime(timeText: string, date?: moment.Moment): moment.Moment {
      const time = moment(timeText, 'HHmm');
      if (date !== undefined) {
        time.set({
          'day': date.day(),
          'month': date.month(),
          'year': date.year()
        });
      }
      return time;
    }

    /**
     * @brief      Parse a date string to a Date object
     *
     * @param      dateText  The date text
     *
     * @return     A Date object
     */
    protected toDate(dateText: string): moment.Moment {
      return moment(dateText, 'YYYY-MM-DD');
    }
}

export interface Station {
    readonly code: string;
    readonly text: string;
}

export interface Disruption {
  readonly code: number;
  readonly text: string;
}
