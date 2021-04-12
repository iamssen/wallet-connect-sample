import { useApp } from 'app/context/app';
import React from 'react';

export function InitSession() {
  const { init } = useApp();

  return (
    <section>
      <button onClick={init}>Connect (Open QR)</button>
    </section>
  );
}
