import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { Document, Outline, Page } from 'react-pdf';

const Pdf: FC = () => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdf, setPdf] = useState<Blob>();
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    setPageNumber(pageNumber);
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pdf-sample`)
      .then(resp => resp.blob())
      .then(blob => setPdf(blob))
      .then(() => setIsLoading(false));
  }, []);

  return isLoading ? (
    <span>Loading pdf...</span>
  ) : (
    <span className="flex flex-col items-center">
      <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
        <Outline onItemClick={onItemClick} />
        <Page pageNumber={pageNumber} width={720} />
      </Document>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setPageNumber(pre => {
              if (pre - 1 >= 1) {
                return pre - 1;
              }
              return pre;
            })
          }
        >
          <ChevronLeft />
        </Button>
        <span className="mx-4">{`${pageNumber} of ${numPages}`}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setPageNumber(pre => {
              if (numPages && pre + 1 <= numPages) {
                return pre + 1;
              }
              return pre;
            })
          }
        >
          <ChevronRight />
        </Button>
      </div>
    </span>
  );
};

export default Pdf;
