import React, { useState } from 'react';
import {
  NewText, CTALinkOrButton, ProgressDots, ClickTarget,
} from '@bluedot/ui';
import { useCompletion } from '@ai-sdk/react';
import { CodeRenderer } from '../components/CodeRenderer';
import { SavedDemoOutput } from './api/saved-output/[savedDemoOutputId]';
import { ShareSavedDemoButton } from '../components/ShareSavedDemoButton';

const DemoPage: React.FC = () => {
  const [view, setView] = useState<'prompt' | 'display'>('prompt');
  const [chapter, setChapter] = useState('');

  const {
    completion: generatedCode, complete, isLoading: loading, error,
  } = useCompletion({
    api: '/api/ai-interview',
    onResponse: () => {
      setView('display');
    },
  });

  const CHAPTERS = [
    '🤖 Future of AI - 2',
    '🤖 Future of AI - 3',
  ];

  // When a chapter is selected, set the chapter and call complete
  const handleChapterSelect = (selectedChapter: string) => {
    setChapter(selectedChapter);
    setView('display');
    complete(selectedChapter);
  };

  if (view === 'prompt' || error || (!loading && !generatedCode)) {
    return (
      <main className="mx-auto px-4">
        <div className="mb-4">
          <NewText.H2 className="mt-4 mb-2">Choose a chapter to get tested on:</NewText.H2>
          <div className="flex flex-col gap-2">
            {CHAPTERS.map((example) => (
              <ClickTarget
                className="cursor-pointer text-size-sm border rounded p-2 m-1 hover:bg-stone-200"
                key={example}
                onClick={() => handleChapterSelect(example)}
              >
                {example}
              </ClickTarget>
            ))}
          </div>
        </div>

        {error && (
        <>
          <NewText.H2 className="text-red-500">Something went wrong</NewText.H2>
          <NewText.P>
            Sorry, we couldn't generate your app. Error: {error?.message ?? 'Unknown'}
          </NewText.P>
          <NewText.P>
            Errors sometime happen when too many people are taking our course at once. You can try again later, or try <NewText.A href="https://web.lmarena.ai/">WebDev Arena</NewText.A> to see a similar demo.
          </NewText.P>
          <CTALinkOrButton onClick={() => setView('prompt')}>Try again</CTALinkOrButton>
        </>
        )}
      </main>
    );
  }

  if (view === 'display' && loading) {
    return (
      <main className="mx-auto px-4">
        <div className="text-center">
          <NewText.H3 className="mt-4 mb-2">AI is generating questions...</NewText.H3>
          <NewText.P className="mb-6">Prompt: {chapter}</NewText.P>
          <ProgressDots />
        </div>
        <CodeRenderer code={generatedCode} height="calc(100vh - 150px)" hidePreview />
      </main>
    );
  }

  if (view === 'display' && generatedCode) {
    return (
      <main className="mx-auto px-4">
        <div className="flex flex-col gap-4 mt-2">
          <CodeRenderer code={generatedCode} height="calc(100vh - 90px)" />
          <div className="flex gap-2 w-fit relative bottom-16 mt-1 -mb-12">
            <ShareSavedDemoButton type="generate-react-component" data={JSON.stringify({ prompt: chapter, code: generatedCode })} text={`I just created an app with AI - using the prompt "${chapter}". You can check it out at this link:`} />
            <CTALinkOrButton variant="secondary" onClick={() => { setView('prompt'); setChapter(''); }} withBackChevron>Start over</CTALinkOrButton>
          </div>
        </div>
      </main>
    );
  }

  // This should be unreachable as all view states are handled above
  return null;
};

export const GenerateReactComponentSavedDemoOutputViewer = ({ savedDemoOutput, courseLink }: { savedDemoOutput: SavedDemoOutput, courseLink: string }) => {
  const { prompt, code } = JSON.parse(savedDemoOutput.data);

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="bg-stone-200 p-4 rounded-md">
        <NewText.P className="font-medium"><NewText.A href={courseLink}>The Future of AI Course</NewText.A> is a free 2-hour online experience to help you prepare for what might be humanity's biggest transition yet. It's packed with up-to-date interactive content - and in this demo, a student got AI to create this app based on the prompt "{prompt}".</NewText.P>
      </div>
      <CodeRenderer code={code} height="calc(100vh - 250px)" />
      <div className="flex gap-2 w-fit relative bottom-16 mt-1 -mb-12">
        <CTALinkOrButton url={courseLink} withChevron>Start learning <span className="hidden md:inline">(and try this yourself)</span></CTALinkOrButton>
      </div>
    </div>
  );
};

export default DemoPage;
