import React, { Component } from 'react';
import './StoryReport.css';

export class StoryReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characterReport: null
    };
  }

  componentDidMount = () => {
    // console.log('StoryReport mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps) => {
    console.log('StoryReport did update');
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('StoryReport will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getCharacterReport({ characterName: id }),
    ]).then((results) => {
      const [characterReport] = results;
      this.setState({
        characterReport
      });
    });
  }

  makeCompletenessLabel = (value, total) => CU.strFormat('{0} ({1}/{2})', [total === 0 ? '-' : `${((value / total) * 100).toFixed(0)}%`, value, total])

  getCompletenessColor = (value, total) => {
    if (total === 0) { return 'transparent'; }
    function calc(b, a, part) {
      return ((a * part) + ((1 - part) * b)).toFixed(0);
    }

    let p = value / total;
    if (p < 0.5) {
      p *= 2;
      return CU.strFormat('rgba({0},{1},{2}, 1)', [calc(251, 255, p), calc(126, 255, p), calc(129, 0, p)]); // red to yellow mapping
    }
    p = (p - 0.5) * 2;
    return CU.strFormat('rgba({0},{1},{2}, 1)', [calc(255, 123, p), calc(255, 225, p), calc(0, 65, p)]); // yellow to green mapping
  }

  render() {
    const { t, id } = this.props;
    const { characterReport } = this.state;

    if (!characterReport) {
      return null;
    }
    return (
      <div className="story-report panel panel-default">
        <div className="panel-heading">
          {/* <a href="#"> */}
          <h3 className="panel-title">{t('profiles.character-report-by-stories')}</h3>
          {/* </a> */}
        </div>
        <div className="panel-body report-by-stories-div">
          <div className="alert alert-info">{t('advices.character-has-no-stories')}</div>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>{t('profiles.story')}</th>
                <th colSpan="4">{t('profiles.activity')}</th>
                <th>{t('profiles.completeness')}</th>
                <th>{t('profiles.meets')}</th>
                <th>{t('profiles.inventory')}</th>
              </tr>
            </thead>
            <tbody>
              {
                characterReport.map((storyInfo) => (
                  <tr className="story-report-row">
                    <td className="story-name">{storyInfo.storyName}</td>
                    <td
                      className={`fa-icon activity-icon activity-icon-active ${storyInfo.activity.active && 'active'}`}
                      title={t('constant.active')}
                    />
                    <td
                      className={`fa-icon activity-icon activity-icon-follower ${storyInfo.activity.follower && 'active'}`}
                      title={t('constant.follower')}
                    />
                    <td
                      className={`fa-icon activity-icon activity-icon-defensive ${storyInfo.activity.defensive && 'active'}`}
                      title={t('constant.defensive')}
                    />
                    <td
                      className={`fa-icon activity-icon activity-icon-passive ${storyInfo.activity.passive && 'active'}`}
                      title={t('constant.passive')}
                    />
                    <td
                      className="completeness text-right"
                      style={
                        {
                          backgroundColor: this.getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations)
                        }
                      }
                    >
                      {this.makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations)}
                    </td>
                    <td className="meets">{storyInfo.meets.join(', ')}</td>
                    <td className="inventory">{storyInfo.inventory}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
