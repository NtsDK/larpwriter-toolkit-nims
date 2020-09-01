import React, { useContext, useEffect, useState } from 'react';
import './ProfileBinding.css';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import Dropdown from 'react-bootstrap/es/Dropdown';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';

export function ProfileList(props) {
  const { droppableId, profileNames, profileType } = props;
  return (
    <Droppable droppableId={droppableId} isCombineEnabled>
      {
        (provided) => (
          <div className="entity-list tw-flex tw-flex-col" ref={provided.innerRef} {...provided.droppableProps}>
            {
              profileNames.map((profile, i) => (
                <Draggable
                  draggableId={JSON.stringify([profileType, profile.displayName])}
                  index={i}
                >
                  {
                    (provided2, snapshot) => (
                      <div
                        className={classNames('btn btn-default tw-flex-auto tw-text-left', {
                          'tw-border-dashed tw-border-2 tw-border-blue-900': snapshot.combineTargetFor
                            && JSON.parse(snapshot.combineTargetFor)[0] !== profileType
                        })}
                        // && (JSON.parse(snapshot.combineTargetFor)[0] !== JSON.parse(snapshot.combineWith)[0])
                        // className={classNames('btn btn-default tw-flex-auto tw-text-left', {
                        //   'tw-bg-green-500 tw-border-dashed tw-border-2 tw-border-blue-900': snapshot.combineTargetFor && snapshot.combineWith
                        //   && (JSON.parse(snapshot.combineTargetFor)[0] !== JSON.parse(snapshot.combineWith)[0])
                        // })}
                        {...provided2.draggableProps}
                        {...provided2.dragHandleProps}
                        ref={provided2.innerRef}
                      >
                        {profile.displayName}
                      </div>
                    )
                  }
                </Draggable>
              ))
            }
            {provided.placeholder}
          </div>
        )
      }
    </Droppable>
  );
}
