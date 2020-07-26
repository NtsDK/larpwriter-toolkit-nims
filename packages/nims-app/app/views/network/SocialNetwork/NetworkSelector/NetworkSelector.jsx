import React, { Component } from 'react';
import './NetworkSelector.css';
import * as Constants from 'nims-dbms/nimsConstants';

export class NetworkSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('NetworkSelector mounted');
  }

  componentDidUpdate() {
    console.log('NetworkSelector did update');
  }

  componentWillUnmount() {
    console.log('NetworkSelector will unmount');
  }

  render() {
    const { something } = this.state;
    const { t } = this.props;

    // if (!something) {
    //   return <div> NetworkSelector stub </div>;
    //   // return null;
    // }
    return (
      <div className="NetworkSelector network-type-area">
        <select size={Constants.networks.length} id="networkSelector" className="form-control">
          {
            Constants.networks.map((networkType) => <option value={networkType}>{t(`constant.${networkType}`)}</option>)
          }
        </select>

        <div id="activityBlock" className="hidden">
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-active"
            data-value="active"
            title={t('constant.active')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-follower"
            data-value="follower"
            title={t('constant.follower')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-defensive"
            data-value="defensive"
            title={t('constant.defensive')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto activity-icon-passive"
            data-value="passive"
            title={t('constant.passive')}
          />
        </div>

        <div id="relationsBlock" className="hidden">
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto allies"
            data-value="allies"
            title={t('briefings.allies')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto directional"
            data-value="directional"
            title={t('briefings.directional')}
          />
          <button
            type="button"
            className="btn btn-default btn-reduced fa-icon flex-0-0-auto neutral"
            data-value="neutral"
            title={t('briefings.neutral')}
          />
        </div>
      </div>
    );
  }
}
