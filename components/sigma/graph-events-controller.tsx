'use client';

import { useRegisterEvents, useSigma } from '@react-sigma/core';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';

function getMouseLayer() {
  return document.querySelector('.sigma-mouse');
}

const GraphEventsController: FC<
  PropsWithChildren<{ setHoveredNode: (node: string | null) => void }>
> = ({ setHoveredNode, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();
  const router = useRouter();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        if (!graph.getNodeAttribute(node, 'hidden')) {
          router.push(`/notes/${graph.getNodeAttribute(node, 'key')}`);
        }
      },
      enterNode({ node }) {
        setHoveredNode(node);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) {
          mouseLayer.classList.add('mouse-pointer');
        }
      },
      leaveNode() {
        setHoveredNode(null);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) {
          mouseLayer.classList.remove('mouse-pointer');
        }
      },
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
