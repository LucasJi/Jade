import { FC } from 'react';

const Pdf: FC<{ url: string }> = ({ url }) => {
  return (
    <div className="flex w-full justify-center">
      <iframe src={url} className="border-0" width="95%" height="600px">
        This browser does not support PDFs. Please download the PDF to view it:{' '}
        <a href={url}>Download PDF</a>.
      </iframe>
    </div>
  );
};

export default Pdf;
