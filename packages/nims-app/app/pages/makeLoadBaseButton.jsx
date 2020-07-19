import React, { Component } from "react";
import classNames from 'classnames';
import { L10n } from 'nims-app-core';

export class LoadBaseButton extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    const input = this.inputRef.current;
    input.value = '';
    input.click();
  }

  render() {
    const { opts, onChange } = this.props;
    const clazz = 'dataLoadButton icon-button';
    const btnName = 'open-database';

    return (
      <button 
        onChange={onChange}
        onClick={this.onClick}
        type="button"
        className={classNames(clazz, 'action-button', {
          [opts.className]: !!opts.className
        })} 
        title={opts.tooltip ? L10n.getValue(`header-${btnName}`) : ''}
        >
          <input ref={this.inputRef} type="file" className="hidden" tabIndex="-1" />
        </button>
    );
  }
}

export function makeLoadBaseButton2(opts, onChange) {
  return <LoadBaseButton opts={opts} onChange={onChange} />;
}