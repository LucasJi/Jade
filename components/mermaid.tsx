'use client';

import mermaid, { RenderResult } from 'mermaid';
import { useCallback, useEffect, useState } from 'react';

interface MermaidProps {
  children: string;
  id?: string;
  className?: string;
  // onClick?: (event: MouseEvent<HTMLElement>) => void;
  // onError?: (error: any) => void;
}

const Mermaid = (props: MermaidProps) => {
  const [element, setElement] = useState<HTMLDivElement>();
  const [renderResult, setRenderResult] = useState<RenderResult>();

  const containerId = `${props.id || 'd' + Date.now()}`;
  const diagramText = props.children;

  // initialize mermaid here, but beware that it gets called once for every instance of the component
  useEffect(() => {
    // wait for page to load before initializing mermaid
    mermaid.initialize({
      startOnLoad: true,
    });
  }, []);

  // hook to track updates to the component ref, compatible with useEffect unlike useRef
  const updateDiagramRef = useCallback((elem: HTMLDivElement) => {
    if (!elem) {
      return;
    }
    setElement(elem);
  }, []);

  // hook to update the component when either the element or the rendered diagram changes
  useEffect(() => {
    if (!element) {
      return;
    }
    if (!renderResult?.svg) {
      return;
    }
    element.innerHTML = renderResult.svg;
    renderResult.bindFunctions?.(element);
  }, [element, renderResult]);

  // hook to handle the diagram rendering
  useEffect(() => {
    if (!diagramText && diagramText.length === 0) {
      return;
    }
    // create async function inside useEffect to cope with async mermaid.run
    (async () => {
      try {
        const rr = await mermaid.render(containerId, diagramText);
        setRenderResult(rr);
        console.log(rr.svg);
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, [diagramText]);

  return (
    <div
      className={props.className}
      // onClick={props.onClick}
      id={containerId}
      ref={updateDiagramRef}
    >
      {props.children}
    </div>
  );
};

export default Mermaid;
