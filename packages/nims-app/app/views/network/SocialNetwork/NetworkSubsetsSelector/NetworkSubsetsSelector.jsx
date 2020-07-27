import React, { Component } from 'react';
import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';
import './NetworkSubsetsSelector.css';

export class NetworkSubsetsSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onStoryNamesChange = this.onStoryNamesChange.bind(this);
    this.onCharacterNamesChange = this.onCharacterNamesChange.bind(this);
  }

  componentDidMount() {
    console.log('NetworkSubsetsSelector mounted');
  }

  componentDidUpdate() {
    console.log('NetworkSubsetsSelector did update');
  }

  componentWillUnmount() {
    console.log('NetworkSubsetsSelector will unmount');
  }

  onTypeChange(e) {
    const {
      onSubsetChange, subset, characterNames, storyNames
    } = this.props;
    const { value } = e.target;
    let selectedStoryNames = [];
    let selectedCharacterNames = [];
    if (value === 'allObjects') {
      // do nothing
    } else if (value === 'selectedCharacters') {
      // selectedStoryNames = [];
      selectedCharacterNames = R.pluck('value', characterNames);
      // onSubsetChange({
      //   type: value,
      //   storyNames: R.pluck('value', storyNames),
      //   characterNames: R.pluck('value', characterNames)
      // });
    } else { // selectedStories
      selectedStoryNames = R.pluck('value', storyNames);
    }
    const drawStoryNames = this.getDrawStoryNames(value, selectedCharacterNames, selectedStoryNames);
    const drawCharacterNames = this.getDrawCharacterNames(value, selectedCharacterNames, selectedStoryNames);

    // selectedStoryNames: [],
    // selectedCharacterNames: [],
    // drawStoryNames: [],
    // drawCharacterNames: [],

    onSubsetChange({
      type: value,
      selectedStoryNames,
      selectedCharacterNames,
      drawStoryNames,
      drawCharacterNames
    });

    // exports.objectSubsets = [
    //   'allObjects',
    //   'selectedCharacters',
    //   'selectedStories',
    // ];

    // type: 'allObjects',
    // onSubsetChange({
    //   ...subset,
    //   type: value
    // });
  }

  onStoryNamesChange(e) {
    const { onSubsetChange, subset } = this.props;
    const selectedStoryNames = Array.from(e.target.selectedOptions, (option) => option.value);
    onSubsetChange({
      ...subset,
      selectedStoryNames,
      drawStoryNames: this.getDrawStoryNames(subset.type, subset.selectedCharacterNames, selectedStoryNames),
      drawCharacterNames: this.getDrawCharacterNames(subset.type, subset.selectedCharacterNames, selectedStoryNames)
    });
  }

  onCharacterNamesChange(e) {
    const { onSubsetChange, subset } = this.props;
    const selectedCharacterNames = Array.from(e.target.selectedOptions, (option) => option.value);
    onSubsetChange({
      ...subset,
      selectedCharacterNames,
      drawStoryNames: this.getDrawStoryNames(subset.type, selectedCharacterNames, subset.selectedStoryNames),
      drawCharacterNames: this.getDrawCharacterNames(subset.type, selectedCharacterNames, subset.selectedStoryNames)
    });
  }

  getDrawCharacterNames(type, selectedCharacterNames, selectedStoryNames) {
    const {
      characterNames, Stories
    } = this.props;
    // const { value } = U.queryEl('#networkSubsetsSelector');

    if (Constants.objectSubsets[0] === type) { // all objects
      return R.pluck('value', characterNames);
    } if (Constants.objectSubsets[1] === type) { // "selected characters"
      // returns character and his neighbours
      // const primaryCharacters = U.nl2array(U.queryEl('#networkCharacterSelector').selectedOptions).map(R.prop('value'));
      const primaryCharacters = selectedCharacterNames;
      const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
      const secondaryCharacters = R.values(Stories)
        .filter((story) => R.keys(story.characters).some(isPrimaryCharacter))
        .map((story) => story.events.filter((event) => R.keys(event.characters).some(isPrimaryCharacter))
          .map((event) => R.keys(event.characters).filter((name) => !isPrimaryCharacter(name))));
      return primaryCharacters.concat(R.uniq(R.flatten(secondaryCharacters)));
    } if (Constants.objectSubsets[2] === type) { //"selected stories"
      // const stories = U.nl2array(U.queryEl('#networkStorySelector').selectedOptions).map(R.prop('value'));
      return R.uniq(R.flatten(selectedStoryNames.map((storyName) => R.keys(Stories[storyName].characters))));
    }
    throw new Error(`Unexpected subsets selector: ${type}`);
  }

  getDrawStoryNames(type, selectedCharacterNames, selectedStoryNames) {
    const {
      storyNames, Stories
    } = this.props;

    if (Constants.objectSubsets[0] === type) { // all objects
      return storyNames.map(R.prop('value'));
    } if (Constants.objectSubsets[1] === type) { // "selected characters"
      const primaryCharacters = selectedCharacterNames;
      const isPrimaryCharacter = R.contains(R.__, primaryCharacters);
      return R.values(Stories)
        .filter((story) => R.keys(story.characters).some(isPrimaryCharacter)).map(R.prop('name'));
    } if (Constants.objectSubsets[2] === type) { //"selected stories"
      return [...selectedStoryNames];
    }
    throw new Error(`Unexpected subsets selector: ${type}`);
  }

  render() {
    const { something } = this.state;
    const {
      t, subset, characterNames, storyNames
    } = this.props;

    return (
      <div className="NetworkSubsetsSelector network-filter-area">
        <select
          size={Constants.objectSubsets.length}
          value={subset.type}
          id="networkSubsetsSelector"
          className="form-control"
          onChange={this.onTypeChange}
        >
          {
            Constants.objectSubsets.map((el) => <option value={el}>{t(`constant.${el}`)}</option>)
          }
        </select>

        {
          subset.type === 'selectedCharacters'
        && (
          <div id="networkCharacterDiv">
            <h4>{t('social-network.characters')}</h4>
            {/* <input selector-filter="#networkCharacterSelector" /> */}
            <select
              value={subset.selectedCharacterNames}
              size={characterNames.length > 15 ? 15 : characterNames.length}
              id="networkCharacterSelector"
              multiple
              className="form-control"
              onChange={this.onCharacterNamesChange}
            >
              {
                characterNames.map((character) => <option key={character.value} value={character.value}>{character.displayName}</option>)
              }
            </select>
          </div>
        )
        }
        {
          subset.type === 'selectedStories'
        && (
          <div id="networkStoryDiv">
            <h4>{t('social-network.stories')}</h4>
            {/* <input selector-filter="#networkStorySelector" /> */}
            <select
              value={subset.selectedStoryNames}
              size={storyNames.length > 15 ? 15 : storyNames.length}
              id="networkStorySelector"
              multiple
              className="form-control"
              onChange={this.onStoryNamesChange}
            >
              {
                storyNames.map((story) => <option key={story.value} value={story.value}>{story.displayName}</option>)
              }
            </select>
          </div>
        )
        }
      </div>
    );
  }
}
