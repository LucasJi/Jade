'use client';

import { FC } from 'react';

interface EmbedFileProps {
  filename: string;
  width?: number;
  height?: number;
}

const EmbedFile: FC<EmbedFileProps> = ({ filename, width, height }) => {
  return (
    <div>
      {`filename: ${filename}, width: ${width}, height: ${height}`}
      <br />
      <img
        width={width}
        height={height}
        src="http://139.224.248.149:9001/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL2phZGUtZG9jcy8lRTklOTklODQlRTQlQkIlQjYvRW5nZWxiYXJ0LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPTcwOFYyV0EyVFFDV0VVTjVVNThHJTJGMjAyNDExMjYlMkZhcC1zaGFuZ2hhaSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNDExMjZUMDg0NjQyWiZYLUFtei1FeHBpcmVzPTQzMTk5JlgtQW16LVNlY3VyaXR5LVRva2VuPWV5SmhiR2NpT2lKSVV6VXhNaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpoWTJObGMzTkxaWGtpT2lJM01EaFdNbGRCTWxSUlExZEZWVTQxVlRVNFJ5SXNJbVY0Y0NJNk1UY3pNalkxTXpNeE5Td2ljR0Z5Wlc1MElqb2liSFZqWVhOcWFTSjkuMXNqTU9teUJGNE5tY0llMHBGM2xUTk11a2hjZjZWdXJpRTdLOFM4OWZERjFRWWFYdVRidjBGSkRLdnAtWkhmSmFuSTB5cmhzZHlSRFFtLVF1NFhqUFEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1kZmE3ZDU4OS1jNjk1LTRhNzgtYWZkZS1hYzIyZDM5N2MxYmYmWC1BbXotU2lnbmF0dXJlPTg3NDkzYTk4MzE4NjliYzMwYWJlMzM2ODhiYzI4OWQxMjczMjVmNDI4NWQxOTFmNjliMGJjYTJhYWM1YjVkMmU"
        alt="pic"
      />
    </div>
  );
};

export default EmbedFile;
