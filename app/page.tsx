import Mermaid from '@/components/mermaid';

export default async function Home() {
  return (
    <div>
      <Mermaid id="test" source={`graph TD;\nA-->B;\nB-->C;`} />
    </div>
  );
}
