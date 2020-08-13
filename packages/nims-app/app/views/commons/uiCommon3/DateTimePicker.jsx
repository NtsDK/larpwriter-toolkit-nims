import React, { useState } from 'react';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';
import dateFormat from 'dateformat';

registerLocale('ru', ru);

const DATE_FORMAT_PATTERN = 'yyyy/mm/dd HH:MM';

export function DateTimePicker(props) {
  // const [startDate, setStartDate] = useState(new Date());
  const {
    defaultDate, date, onChange, ...elementProps
  } = props;
  const [dateValue, setDateValue] = useState(date || null);
  const { t, i18n } = useTranslation();
  // console.log(i18n);
  // isClearable
  // readOnly

  let placeholderText = '';
  if (defaultDate) {
    placeholderText = t('common.date-by-default', {
      displayDate: dateFormat(defaultDate, DATE_FORMAT_PATTERN)
    });
  }
  function innerOnChange(date) {
    setDateValue(date);
    if (onChange) {
      onChange({
        date,
        dateStr: dateFormat(date, DATE_FORMAT_PATTERN)
      });
    }
  }

  return (
    <DatePicker
      dateFormat="yyyy/MM/dd HH:mm"
      showTimeSelect
      timeFormat="HH:mm"
      // showMonthDropdown
      // showYearDropdown
      selected={dateValue}
      onChange={innerOnChange}
      timeIntervals={15}
      // dropdownMode="select"
      timeCaption={t('common.time')}
      locale={i18n.language}
      // locale="ru-RU"
      // locale="ru"
      placeholderText={placeholderText}
      {...elementProps}
    />
  );

  // return (
  //   <DatePicker
  //     selected={new Date()}
  //     onChange={() => (0)}
  //   />
  // );
  // const {
  //   checked, onChange, title, data, tooltip, type, name, className, text, ...elementProps
  // } = props;
  // const dataAttrs = {};
  // if (data) {
  //   R.keys(data).forEach((name) => (dataAttrs[`data-${name}`] = data[name]));
  // }
  // if (type === 'radio' && !name) {
  //   throw new Error('Name is required for radio');
  // }

  // const body = (
  //   <label
  //     // need this to use OverlayTrigger. Otherwise it doesn't work
  //     // eslint-disable-next-line react/jsx-props-no-spreading
  //     {...elementProps}
  //     className={classNames('btn btn-default fa-icon', className, { 'btn-primary': checked })}
  //     title={title}
  //   >
  //     {text}
  //     <input
  //       type={type}
  //       name={name}
  //       checked={checked}
  //       autoComplete="off"
  //       className="sr-only"
  //       // className="tw-hidden"
  //       onChange={onChange}
  //       // eslint-disable-next-line react/jsx-props-no-spreading
  //       {...dataAttrs}
  //     />
  //   </label>
  // );

  // return tooltip ? (
  //   <OverlayTrigger placement="top" overlay={tooltip}>
  //     {body}
  //   </OverlayTrigger>
  // ) : body;
}

// class Example extends React.Component {
//   state = {
//     startDate: new Date()
//   };

//   handleChange = date => {
//     this.setState({
//       startDate: date
//     });
//   };

//   render() {
//     return (
//       <DatePicker
//         selected={this.state.startDate}
//         onChange={this.handleChange}
//       />
//     );
//   }
// }

//     UI.makeEventTimePicker2(timeInput, {
//       eventTime: event.time,
//       index: event.index,
//       preGameDate: metaInfo.preGameDate,
//       date: metaInfo.date,
//       onChangeDateTimeCreator: onChangeDateTimeCreator(storyName)
//     });

// export const makeEventTimePicker2 = (input, opts) => {
//   input.value = opts.eventTime;

//   input.eventIndex = opts.index;

//   const pickerOpts = {
//     lang: L10n.getLang(),
//     mask: true,
//     startDate: new Date(opts.preGameDate),
//     endDate: new Date(opts.date),
//     onChangeDateTime: opts.onChangeDateTimeCreator(input),
//   };

//   if (opts.eventTime !== '') {
//     pickerOpts.value = opts.eventTime;
//   } else {
//     pickerOpts.value = opts.date;
//     U.addClass(input, 'defaultDate');
//   }

//   jQuery(input).datetimepicker(pickerOpts);
//   return input;
// };
