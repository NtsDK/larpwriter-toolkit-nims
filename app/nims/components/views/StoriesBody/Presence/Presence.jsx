import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Presence.css';

export default class Presence extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('Presence mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Presence did update');
  }

  componentWillUnmount = () => {
    console.log('Presence will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      // PermissionInformer.isEntityEditable({ type: 'story', name: Stories.getCurrentStoryName() }),
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getStoryCharacterNamesArray({ storyName: id }),
      dbms.getStoryEvents({ storyName: id })
    ]).then((results) => {
      const [allCharacters, characterArray, events] = results;
      console.log(results);
      this.setState({
        allCharacters, characterArray, events
      });
    });
  }

  render() {
    const { allCharacters, characterArray, events } = this.state;
    const { t } = this.props;
    // console.log()

    if (!allCharacters) {
      return null;
    }
    // style="overflow-x:auto;"
    return (
      <div className="presence panel panel-default">
        <div className="alert no-characters alert-info margin-bottom-8">{t('advices.no-characters-in-story')}</div>
        <div className="alert no-events alert-info margin-bottom-8">{t('advices.no-events-in-story')}</div>
        <div className="panel-body flex-row">
          <div className="flex-0-0-auto margin-right-8">
            <select multiple id="eventPresenceSelector" size={characterArray.length} className="form-control">
              {
                characterArray.map(name => (<option value={name} selected>{name}</option>))
              }
            </select>
          </div>
          <div className="flex-1-1-auto">
            <table cellSpacing="0" cellPadding="0" className="table table-bordered">
              <thead id="eventPresenceTableHead">
                <tr>
                  <th />

                  {
                    characterArray.map(name => (<th>{name}</th>))
                  }
                </tr>
              </thead>
              <tbody id="eventPresenceTable">
                {
                  events.map(event => (
                    <tr>
                      <td>
                        {event.name}
                        {/* {event} */}
                      </td>
                      {
                        (() => {
                          const eventCharacters = R.keys(event.characters);
                          return characterArray.map(name => (<td>{eventCharacters.includes(name) ? 'true' : ''}</td>));
                        })()
                      }

                    </tr>
                  ))
                }

              </tbody>
            </table>
          </div>
        </div>
      </div>

    // {/* <div id="eventPresenceDiv" class="">
    // <div class="panel panel-default">
    // </div>

    // <template class="event-presence-cell">
    //   <td class="vertical-aligned-td">
    //     <input class="isStoryEditable hidden" type="checkbox">
    //     <label class="checkbox-label checkbox-label-icon"><span class="margin-left-8"></span></label>
    //   </td>
    // </template>
    // </div> */}
    );
  }
}

Presence.propTypes = {
  // bla: PropTypes.string,
};

Presence.defaultProps = {
  // bla: 'test',
};
