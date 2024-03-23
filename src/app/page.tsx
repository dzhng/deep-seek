'use client';

import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: 'Prompt must be at least 2 characters.',
  }),
});

export default function Home() {
  const runQuery = trpc.run.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      runQuery.mutate({ prompt: values.prompt });
      form.reset();
      toast('Submitted');
    },
    [form, runQuery],
  );

  return (
    <main className="min-h-screen space-y-3 p-24">
      <h1 className="text-lg font-bold">Deep Seek</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query</FormLabel>
                <FormControl>
                  <Input placeholder="Hello world" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-[140px]"
            type="submit"
            disabled={runQuery.isLoading}
          >
            {runQuery.isLoading ? 'Researching...' : 'Submit'}
          </Button>
        </form>
      </Form>

      <hr />
      <div>
        {runQuery.data && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {runQuery.data.columns.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {runQuery.data.table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                      >
                        {cell ? cell.text : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
