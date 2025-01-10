'use client';

import { CSSProperties, FC, useEffect } from 'react';

import { SigmaContainer } from '@react-sigma/core';
import '@react-sigma/core/lib/react-sigma.min.css';
import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';

import { SampleGraph } from './sample-graph';

const Fa2: FC = () => {
  const { start, kill } = useWorkerLayoutForceAtlas2({
    settings: { slowDown: 10 },
  });

  useEffect(() => {
    // start FA2
    start();

    // Kill FA2 on unmount
    return () => {
      kill();
    };
  }, [start, kill]);

  return null;
};

export const LayoutFA2: FC<{ style: CSSProperties }> = ({ style }) => {
  return (
    <SigmaContainer style={style} settings={{ allowInvalidContainer: true }}>
      <SampleGraph />
      <Fa2 />
    </SigmaContainer>
  );
};
