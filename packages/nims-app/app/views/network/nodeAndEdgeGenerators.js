import * as Constants from 'nims-dbms/nimsConstants';
import * as R from 'ramda';

const STORY_PREFIX = 'St:';
const CHAR_PREFIX = 'Ch:';
const PROFILE_GROUP = 'prof-';
const FILTER_GROUP = 'filter-';

export function getStoryNodes(Stories, storyNames) {
  const nodes = storyNames.map((name) => ({
    id: STORY_PREFIX + name,
    label: name.split(' ').join('\n'),
    value: Object.keys(Stories[name].characters).length,
    title: Object.keys(Stories[name].characters).length,
    group: 'storyColor',
    type: 'story',
    originName: name,
  }));
  return nodes;
}

export function getActivityEdges(stories, selectedActivities) {
  return R.flatten(R.keys(stories).map((name) => R.keys(stories[name].characters)
    .map((char1) => R.keys(stories[name].characters[char1].activity).filter(R.contains(R.__, selectedActivities))
      .map((activity) => ({
        from: STORY_PREFIX + name,
        to: CHAR_PREFIX + char1,
        color: Constants.snActivityColors[activity],
        width: 2,
        hoverWidth: 4
      })))));
}

export function getRelationEdges(relations, selectedRelations) {
  const checked = R.contains(R.__, selectedRelations);
  return R.flatten(relations.map((rel) => {
    const arr = [];
    const { starter } = rel;
    const { ender } = rel;
    const edgeTmpl = {
      from: CHAR_PREFIX + starter,
      to: CHAR_PREFIX + ender,
      color: Constants.snRelationColors.neutral,
      width: 2,
      hoverWidth: 4
    };
    if (rel.essence.length === 0) {
      if (checked('neutral')) {
        arr.push(R.merge(edgeTmpl, {
          color: Constants.snRelationColors.neutral,
        }));
      }
    } else {
      if (checked('allies') && R.contains('allies', rel.essence)) {
        arr.push(R.merge(edgeTmpl, {
          color: Constants.snRelationColors.allies,
        }));
      }
      if (checked('directional') && R.contains('starterToEnder', rel.essence)) {
        arr.push(R.merge(edgeTmpl, {
          color: Constants.snRelationColors.starterToEnder,
          arrows: 'to'
        }));
      }
      if (checked('directional') && R.contains('enderToStarter', rel.essence)) {
        arr.push(R.merge(edgeTmpl, {
          color: Constants.snRelationColors.enderToStarter,
          arrows: 'from'
        }));
      }
    }
    return arr;
  }));
}

export function getStoryEdges(Stories) {
  return R.flatten(R.keys(Stories).map((name) => R.keys(Stories[name].characters).map((char1) => ({
    from: STORY_PREFIX + name,
    to: CHAR_PREFIX + char1,
    color: 'grey'
  }))));
}

// function getEventDetails() {
//   return R.flatten(R.values(state.Stories).map((story) => story.events.map((event) => ({
//     eventName: event.name,
//     storyName: story.name,
//     time: event.time,
//     characters: R.keys(event.characters)
//   }))));
// }

export function getDetailedEdges(Stories) {
  const edgesCheck = {};
  R.values(Stories).forEach((story) => {
    story.events.forEach((event) => {
      const charNames = R.keys(event.characters).sort();
      charNames.forEach((char1, i) => {
        charNames.forEach((char2, j) => {
          if (i <= j) {
            return;
          }
          const key = char1 + char2;
          if (!edgesCheck[key]) {
            edgesCheck[key] = {
              from: CHAR_PREFIX + char1,
              to: CHAR_PREFIX + char2,
              title: {},
            };
          }
          edgesCheck[key].title[story.name] = true;
        });
      });
    });
  });

  return R.values(edgesCheck).map((edgeInfo) => {
    const title = R.keys(edgeInfo.title).sort().join(', ');
    const value = R.keys(edgeInfo.title).length;
    return {
      from: edgeInfo.from,
      to: edgeInfo.to,
      title: `${value}: ${title}`,
      value,
      color: 'grey'
    };
  });
}
