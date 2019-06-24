import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Stories.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';
import StoriesBody from '../StoriesBody';


export default class Stories extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('Stories mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Stories did update');
  }

  componentWillUnmount = () => {
    console.log('Stories will unmount');
  }


  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'story' }),
    ]).then((results) => {
      const [storyNames] = results;
      storyNames.sort(CU.charOrdA);
      this.setState({
        storyNames
      });
    });
  }

  render() {
    const { storyNames } = this.state;
    const { dbms, t } = this.props;

    if (!storyNames) {
      return null;
    }
    return (
      <Switch>
        <Route
          path="/stories"
          render={() => (storyNames.length === 0
            ? <div className="alert-block alert alert-info">{t('advices.no-story')}</div>
            : <Redirect to={`/stories/writerStory/events/${storyNames[0]}`} />)}
          exact
        />
        <Route
          path="/stories/:tab1/:tab2/:id"
          render={({ match }) => {
            const { tab1, tab2, id } = match.params;
            return (
              <div className="block">
                {`${tab1} ${tab2} ${id}`}
                <StoriesBody tab1={tab1} tab2={tab2} id={id} dbms={dbms} />
              </div>
            );
            // <div>
            //   {`${tab1} ${tab2} ${id}`}
            //   {/* <StoryReport id={id} dbms={dbms} />
            //   <RelationReport id={id} dbms={dbms} />
            //   <CharacterProfile id={id} dbms={dbms} /> */}
            // </div>
          }}
        />

      </Switch>
    );

    // return (
    //   <div className="stories block">
    //     <div className="panel panel-default">
    //       <div className="panel-body first-panel">
    //         <div className="flex-row entity-toolbar">
    //           <button
    //             type="button"
    //             className="btn btn-default btn-reduced fa-icon create story flex-0-0-auto icon-padding"
    //             title={t('stories.create-entity')}
    //           >
    //             <span>{t('stories.story')}</span>
    //           </button>
    //           <select id="storySelector" className="common-select form-control">
    //             {
    //               storyNames.map(name => (<option value={name}>{name}</option>))
    //             }
    //           </select>
    //           <button
    //             type="button"
    //             className="btn btn-default btn-reduced fa-icon rename story flex-0-0-auto isStoryEditable"
    //             title={t('stories.rename-entity')}
    //           />
    //           <button
    //             type="button"
    //             className="btn btn-default btn-reduced fa-icon remove story flex-0-0-auto isStoryEditable"
    //             title={t('stories.remove-entity')}
    //           />
    //           <button
    //             type="button"
    //             className="btn btn-default btn-reduced fa-icon create event flex-0-0-auto icon-padding isStoryEditable"
    //             title={t('stories.create-event')}
    //           >
    //             <span>{t('stories.event')}</span>
    //           </button>
    //           <button
    //             type="button"
    //             className="btn btn-default btn-reduced fa-icon add character flex-0-0-auto icon-padding isStoryEditable"
    //             title={t('stories.add-character')}
    //           >
    //             <span>{t('stories.character')}</span>
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="alert alert-info">{t('advices.no-story')}</div>
    //   </div>
    // );

    //     <div class="stories-tab block">
    // <div class="panel panel-default">
    //   <div class="panel-body first-panel">
    //     <div class="flex-row entity-toolbar">
    //       <button class="btn btn-default btn-reduced fa-icon create story flex-0-0-auto icon-padding"
    //         l10n-title="stories-create-entity"><span l10n-id="stories-story"></span></button>
    //       <select id="storySelector" class="common-select"></select>
    //       <button class="btn btn-default btn-reduced fa-icon rename story flex-0-0-auto isStoryEditable"
    //         l10n-title="stories-rename-entity"></button>
    //       <button class="btn btn-default btn-reduced fa-icon remove story flex-0-0-auto isStoryEditable"
    //         l10n-title="stories-remove-entity"></button>
    //       <button class="btn btn-default btn-reduced fa-icon create event flex-0-0-auto icon-padding isStoryEditable"
    //         l10n-title="stories-create-event"><span l10n-id="stories-event"></span></button>
    //       <button class="btn btn-default btn-reduced fa-icon add character flex-0-0-auto icon-padding isStoryEditable"
    //         l10n-title="stories-add-character"><span l10n-id="stories-character"></span></button>
    //     </div>
    //   </div>
    // </div>

    // <div class="alert alert-info" l10n-id="advices-no-story"></div>

    //   <div class="stories-main-container">
    //     <div class="stories-navigation-container">
    //       <div class="left-side"></div>
    //       <div class="right-side"></div>
    //     </div>
    //     <div class="stories-content-container">
    //       <div class="left-side"></div>
    //       <div class="right-side"></div>
    //     </div>
    //   </div>
    // </div>
  }
}

Stories.propTypes = {
  // bla: PropTypes.string,
};

Stories.defaultProps = {
  // bla: 'test',
};
