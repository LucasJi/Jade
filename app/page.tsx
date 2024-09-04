import { Callout, CalloutBody, CalloutTitle } from '@/components/callout';

export default async function Home() {
  return (
    <div className="flex w-full  flex-col items-center">
      <Callout variant="info" isFoldable>
        <CalloutTitle title="Outer Callout" />
        <CalloutBody>
          <Callout variant="error" isFoldable>
            <CalloutTitle title="Inner Callout" />
            <CalloutBody>
              <Callout variant="abstract">
                <CalloutTitle title="Innermost Callout" />
                <CalloutBody>
                  <p>Innermost Callout Body</p>
                </CalloutBody>
              </Callout>
              <p>Inner Callout Body</p>
            </CalloutBody>
          </Callout>
          <p>Outer Callout Body</p>
        </CalloutBody>
      </Callout>

      <Callout variant="info" isFoldable defaultFolded>
        <CalloutTitle title="Callout Title" />
        <CalloutBody>
          <p>Callout Body</p>
        </CalloutBody>
      </Callout>
    </div>
  );
}
