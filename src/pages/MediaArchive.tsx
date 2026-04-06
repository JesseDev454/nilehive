import { useState } from "react";
import { mockArchive } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function MediaArchive() {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ images, index });
  };

  const nextImage = () => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
  };

  const prevImage = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Media Archive</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse photos and reports from completed events</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockArchive.map((item) => (
          <Card key={item.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openLightbox(item.images, 0)}>
            <div className="aspect-video overflow-hidden">
              <img src={item.thumbnail} alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.club} · {item.date}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs"
                  onClick={(e) => { e.stopPropagation(); }}>
                  <Download className="h-3 w-3 mr-1" /> Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 bg-foreground/95 border-none">
          <DialogTitle className="sr-only">Image lightbox</DialogTitle>
          {lightbox && (
            <div className="relative">
              <img src={lightbox.images[lightbox.index]} alt="Event photo"
                className="w-full max-h-[80vh] object-contain" />
              {lightbox.images.length > 1 && (
                <>
                  <Button variant="ghost" size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
                    onClick={prevImage}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
                    onClick={nextImage}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              <p className="text-center text-background/60 text-sm py-2">
                {lightbox.index + 1} / {lightbox.images.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
