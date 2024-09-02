import { Details, Summary } from '@/components/ui/details';

export default async function Home() {
  return (
    <div className="flex w-full items-center flex-col">
      <Details>
        <Summary title="title" />

        <div className="mt-4 ml-8 leading-normal [&>*]:transition-all">
          <Details>
            <Summary title="title" />

            <div className="mt-4 ml-8 leading-normal">
              <p>Inner Callout</p>
            </div>
          </Details>
          <p>
            I lived near lake Eerie and I really miss sunsets over the water.We
            can all grab at the chance to be handsome farmers. YEAH you can have
            21 sons be blood when they marry my daughters. And the pain that we
            left at the station will stay in a jar behind us. We can pickle the
            pain into blue ribbon winners at county contests.... Gosh. I loved
            her to bits
          </p>
        </div>
      </Details>
    </div>
  );
}
