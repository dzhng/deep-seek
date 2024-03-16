'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [input, setInput] = useState('');

  const onSubmit = useCallback(() => {
    setInput('');
    toast('Submitted');
  }, []);

  return (
    <main className="min-h-screen space-y-3 p-24">
      <h1 className="text-lg font-bold">Prompt</h1>
      <Input value={input} onChange={e => setInput(e.target.value)} />
      <Button onClick={onSubmit}>Submit</Button>
    </main>
  );
}
