'use client';

import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

const Mermaid = ({ source, id }: { source: string; id: string }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({});
  }, []);

  useEffect(() => {
    const initializeMermaid = async () => {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = source;
        const { svg, bindFunctions } = await mermaid.render(
          `mermaid-diagram-${id}`,
          source,
        );
        mermaidRef.current.innerHTML = svg;
        bindFunctions?.(mermaidRef.current);
      }
    };

    initializeMermaid().catch(e => console.error(e));

    return () => {};
  }, [source]);

  return <div ref={mermaidRef} id={id}></div>;
};

export default Mermaid;
