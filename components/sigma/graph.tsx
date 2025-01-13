'use client';
import {
  ControlsContainer,
  FullScreenControl,
  SearchControl,
  SigmaContainer,
  useRegisterEvents,
  useSigma,
  ZoomControl,
} from '@react-sigma/core';

import '@react-sigma/core/lib/react-sigma.min.css';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { LayoutsControl } from './layouts-control';
import { SampleGraph } from './sample-graph';

export const Graph: FC<{ style?: CSSProperties }> = ({ style }) => {
  const GraphEvents: FC = () => {
    const registerEvents = useRegisterEvents();
    const sigma = useSigma();
    const [draggedNode, setDraggedNode] = useState<string | null>(null);

    useEffect(() => {
      // Register the events
      registerEvents({
        downNode: e => {
          setDraggedNode(e.node);
          sigma.getGraph().setNodeAttribute(e.node, 'highlighted', true);
        },
        // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
        mousemovebody: e => {
          if (!draggedNode) {
            return;
          }
          // Get new position of node
          const pos = sigma.viewportToGraph(e);
          sigma.getGraph().setNodeAttribute(draggedNode, 'x', pos.x);
          sigma.getGraph().setNodeAttribute(draggedNode, 'y', pos.y);

          // Prevent sigma to move camera:
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        },
        // On mouse up, we reset the autoscale and the dragging mode
        mouseup: () => {
          if (draggedNode) {
            setDraggedNode(null);
            sigma.getGraph().removeNodeAttribute(draggedNode, 'highlighted');
          }
        },
        // Disable to autoscale at the first down interaction
        mousedown: () => {
          if (!sigma.getCustomBBox()) {
            sigma.setCustomBBox(sigma.getBBox());
          }
        },
      });
    }, [registerEvents, sigma, draggedNode]);

    return null;
  };

  return (
    <SigmaContainer settings={{ allowInvalidContainer: true }} style={style}>
      <SampleGraph />
      <ControlsContainer position={'bottom-right'}>
        <ZoomControl />
        <FullScreenControl />
        <LayoutsControl />
      </ControlsContainer>
      <ControlsContainer position={'top-right'}>
        <SearchControl style={{ width: '200px' }} />
      </ControlsContainer>
    </SigmaContainer>
  );
};
