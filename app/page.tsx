import Mermaid from '@/components/mermaid';

export default async function Home() {
  return (
    <div>
      <Mermaid id="test">{`graph TD;\nA-->B;\nB-->C;`}</Mermaid>
    </div>
  );
}
