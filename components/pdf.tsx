import { FC } from 'react';

const Pdf: FC = () => {
  return (
    <div className="flex w-full justify-center">
      <iframe
        src={`${process.env.NEXT_PUBLIC_BASE_URL}/api/pdf-sample`}
        className="border-0"
        width="95%"
        height="600px"
      >
        This browser does not support PDFs. Please download the PDF to view it:{' '}
        <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/pdf-sample`}>
          Download PDF
        </a>
        .
      </iframe>
    </div>
  );
};

export default Pdf;
