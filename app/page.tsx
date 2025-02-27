import { Grape } from 'lucide-react';
import Link from 'next/link';
import UploadForm from '@/components/upload-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-wine-950/50">
      <header className="sticky top-0 z-50 border-b bg-background/50 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Grape className="size-6 text-wine-600" />
            <span className="font-serif text-xl">WUpload</span>
          </Link>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground md:text-4xl">
              Enrich Your Wine Data
            </h1>
            <p className="text-lg text-muted-foreground">
              Let our AI sommelier fill in the missing details in your wine
              database
            </p>
          </div>

          <UploadForm />

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="font-serif">How It Works</CardTitle>
              <CardDescription>
                Simple steps to enrich your wine data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Upload Your CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or select your wine database CSV file
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">2. AI Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI sommelier analyzes and completes missing information
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">3. Expert Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverages extensive wine expertise and real-time data
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">4. Download Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your enriched CSV file with completed wine details
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Warning: Generated data may contain inaccuracies or errors. It
                  is recommended to verify the information carefully.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-auto py-6">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            made by{' '}
            <Link
              href="https://github.com/Sgulli"
              className="font-serif text-wine-600 transition-colors hover:text-wine-500"
            >
              Sgulli
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
