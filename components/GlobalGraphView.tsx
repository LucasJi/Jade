'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { PiGraphLight } from 'react-icons/pi';
import ForceDirectedGraph from './ForceDirectedGraph';
import LgSpinnerInCenter from './LgSpinnerInCenter';

const GlobalGraphView = ({ className = '' }: { className?: string }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [postGraph, setPostGraph] = useState();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`, {
      method: 'GET',
    })
      .then(resp => resp.json())
      .then(data => setPostGraph(data));
  }, []);

  return (
    <div className={classNames('w-fit h-fit', className)}>
      <Button
        onPress={onOpen}
        isIconOnly
        variant="light"
        radius="sm"
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
                <LgSpinnerInCenter />
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
