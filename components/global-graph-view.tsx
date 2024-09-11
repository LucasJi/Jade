'use client';

import { Button } from '@/components/ui/button';
import { NoteGraph } from '@types';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { PiGraphLight } from 'react-icons/pi';

const GlobalGraphView = ({ className = '' }: { className?: string }) => {
  const [postGraph, setPostGraph] = useState<NoteGraph>();

  useEffect(() => {
    // getPosts()
    //   .then(posts => {
    //     return getPostGraphFromPosts(posts);
    //   })
    //   .then(data => setPostGraph(data));
  }, []);

  return (
    <div className={clsx('h-fit w-fit', className)}>
      <Button
        // onClick={onOpen}
        // isIconOnly
        // radius="sm"
        className="absolute right-0 top-0 mr-1 mt-1"
        size="sm"
      >
        <PiGraphLight size={20} />
      </Button>
      {/*<Modal*/}
      {/*  isOpen={isOpen}*/}
      {/*  onOpenChange={onOpenChange}*/}
      {/*  hideCloseButton*/}
      {/*  radius="sm"*/}
      {/*  size="lg"*/}
      {/*>*/}
      {/*  <ModalContent>*/}
      {/*    <ModalHeader className="flex flex-col items-center">*/}
      {/*      Graph View for All Posts*/}
      {/*    </ModalHeader>*/}

      {/*    <ModalBody>*/}
      {/*      {postGraph ? (*/}
      {/*        <ForceDirectedGraph postGraph={postGraph} border={false} full />*/}
      {/*      ) : (*/}
      {/*        <div className="w-[300px] h-[300px]">*/}
      {/*          <Loader />*/}
      {/*        </div>*/}
      {/*      )}*/}
      {/*    </ModalBody>*/}
      {/*  </ModalContent>*/}
      {/*</Modal>*/}
      <div className="relative"></div>
    </div>
  );
};

export default GlobalGraphView;
