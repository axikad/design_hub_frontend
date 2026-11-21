import React, { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { commerceApi, getErrorMessage } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';

interface Props {
  type: 'design' | 'folder';
  id: string;
  imageIndex?: number;
  label?: string;
  className?: string;
}

const startDownload = (url: string, fileName?: string) => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener';
  if (fileName) anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export const ProtectedDownloadButton: React.FC<Props> = ({ type, id, imageIndex, label = 'Download files', className = '' }) => {
  const { showToast } = useApp();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (type === 'folder') {
        const response = await commerceApi.downloadFolder(id);
        startDownload(response.data.downloadUri);
      } else {
        const response = imageIndex === undefined
          ? await commerceApi.downloadDesign(id)
          : await commerceApi.downloadDesignImage(id, imageIndex);
        startDownload(response.data.url, response.data.fileName);
      }
      showToast('Download ready', 'Your protected download has started.', 'success');
    } catch (error) {
      showToast('Download unavailable', getErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return <button type="button" onClick={download} disabled={busy} className={className || 'inline-flex items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60'}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{busy ? 'Preparing…' : label}</button>;
};
