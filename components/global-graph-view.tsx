'use client';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/modal';
import { useEffect, useState } from 'react';
import { PiGraphLight } from 'react-icons/pi';
import ForceDirectedGraph from './force-directed-graph';
import clsx from 'clsx';
import { getPosts } from '@/utils/getPosts';
import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { PostGraph } from '@types';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';

const GlobalGraphView = ({ className = '' }: { className?: string }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [postGraph, setPostGraph] = useState<PostGraph>();

  useEffect(() => {
    getPosts()
      .then(posts => {
        return getPostGraphFromPosts(posts);
      })
      .then(data => setPostGraph(data));
  }, []);

  return (
    <div className={clsx('w-fit h-fit', className)}>
      <Button
        onClick={onOpen}
        // isIconOnly
        // radius="sm"
        className="absolute right-0 top-0 mr-1 mt-1"
        size="sm"
      >
        <PiGraphLight size={20} />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        radius="sm"
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center">
            Graph View for All Posts
          </ModalHeader>

          <ModalBody>
            {postGraph ? (
              <ForceDirectedGraph postGraph={postGraph} border={false} full />
            ) : (
              <div className="w-[300px] h-[300px]">
                <Loader />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className="relative"></div>
    </div>
  );
};

export default GlobalGraphView;
