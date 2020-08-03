import React, { Component } from 'react';
import PermissionInformer from 'permissionInformer';
import { UI, U, L10n } from 'nims-app-core';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect,
  useParams,
  useHistory
} from 'react-router-dom';
import './Relations.css';
import { RelationsContent } from '../RelationsContent';

function RelationCharacterSelect(props) {
  const { characterNames } = props;
  const { id: selectedCharacterName } = useParams();
  const history = useHistory();
  function onChange(e) {
    history.push(`/relations/${e.target.value}`);
  }

  return (
    <select className="character-select common-select" value={selectedCharacterName} onChange={onChange}>
      {
        characterNames.map((name) => <option key={name.value} value={name.value}>{name.displayName}</option>)
      }
    </select>
  );
}

export class Relations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characterProfileStructure: {},
      characterNames: [],
    };
    // this.onCharacterChange = this.onCharacterChange.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('Relations mounted');
  }

  componentDidUpdate() {
    console.log('Relations did update');
  }

  componentWillUnmount() {
    console.log('Relations will unmount');
  }

  refresh() {
    Promise.all([
      DBMS.getProfileStructure({ type: 'character' }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
    ]).then((results) => {
      const [characterProfileStructure, characterNames] = results;

      this.setState({
        characterProfileStructure,
        characterNames,
      });
    }).catch(UI.handleError);
  }

  render() {
    const { characterNames, characterProfileStructure } = this.state;
    const { t } = this.props;

    return (
      <div className="Relations relations-tab block">
        {
          characterNames.length < 2
          && (
            <div className="alert alert-info">
              {t('advices.no-characters-for-relations')}
            </div>
          )
        }
        {
          characterNames.length > 1
          && (
            <div className="panel panel-default">
              <div className="panel-heading">
                <Switch>
                  <Route path="/relations/:id">
                    <RelationCharacterSelect characterNames={characterNames} />
                  </Route>
                  <Route path="/relations">
                    {characterNames.length > 0
                  && <Redirect to={`/relations/${characterNames[0].value}`} />}
                  </Route>
                </Switch>

              </div>
              <Route
                path="/relations/:id"
                render={({ match }) => {
                  const { id } = match.params;
                  return (
                    <div className="panel-body">
                      <RelationsContent
                        characterName={id}
                        isAdaptationsMode
                        characterProfileStructure={characterProfileStructure}
                      />
                    </div>
                  );
                }}
              />
            </div>
          )
        }
      </div>
    );
  }
}
