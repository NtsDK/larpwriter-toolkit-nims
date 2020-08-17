import React, { Component } from 'react';
import './GroupSchemaV2.css';
import { UI, U, L10n } from 'nims-app-core';
import { drawSchema } from '../drawSchema';

export class GroupSchemaV2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.theorySvg = React.createRef();
    this.practiceSvg = React.createRef();
  }

  componentDidMount() {
    this.refresh();
    console.log('GroupSchemaV2 mounted');
  }

  componentDidUpdate() {
    console.log('GroupSchemaV2 did update');
  }

  componentWillUnmount() {
    console.log('GroupSchemaV2 will unmount');
  }

  refresh() {
    const { dbms } = this.props;
    dbms.getGroupSchemas().then((schemas) => {
      U.clearEl(this.theorySvg.current);
      drawSchema(schemas.theory, this.theorySvg.current);
      U.clearEl(this.practiceSvg.current);
      drawSchema(schemas.practice, this.practiceSvg.current);
    }).catch(UI.handleError);
  }

  render() {
    const { t } = this.props;
    return (
      <div className="GroupSchemaV2 group-schema-tab">
        <div className="panel panel-default">
          <div className="panel-body">
            <label>{t('groups.theoretical-group-schema')}</label>
            <div className="" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="flex-0-0-auto">
                <svg ref={this.theorySvg} className="theory" width="960" height="450" />
              </div>
            </div>
            <label>{t('groups.practical-group-schema')}</label>
            <div className="" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="flex-0-0-auto">
                <svg ref={this.practiceSvg} className="practice" width="960" height="450" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
