/* Harness entry: mounts the real page into an interactive DOM so dialog focus,
   scroll locking and keyboard behaviour can be asserted rather than assumed. */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import ListingPage from '../../../src/app/page';

const host = document.getElementById('root');
if (host) createRoot(host).render(React.createElement(ListingPage));
