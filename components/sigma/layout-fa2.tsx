'use client';
import {
  ControlsContainer,
  FullScreenControl,
  SearchControl,
  SigmaContainer,
  ZoomControl,
} from '@react-sigma/core';

import '@react-sigma/core/lib/react-sigma.min.css';
import { CSSProperties, FC } from 'react';
import { LayoutsControl } from './layouts-control';
import { SampleGraph } from './sample-graph';

export const LayoutFA2: FC<{ style?: CSSProperties }> = ({ style }) => {
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
