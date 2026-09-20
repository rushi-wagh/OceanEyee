import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Camera,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { showToast } from "@/components/ui/showToast";
import { LocationPicker } from "@/features/citizen/LocationPicker";
import { zodResolver } from "@/lib/zodResolver";
import { useReportStore } from "@/store/reportStore";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EMPTY_IMAGES = [];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), "Only image files are allowed")
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Each image must be 5 MB or smaller");

const reportSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or fewer"),
  locationName: z.string().trim().max(160, "Location name must be 160 characters or fewer").optional().or(z.literal("")),
  latitude: z.number({ invalid_type_error: "Latitude is required" }),
  longitude: z.number({ invalid_type_error: "Longitude is required" }),
  images: z.array(fileSchema).max(MAX_IMAGES, `You can upload up to ${MAX_IMAGES} images`).default([]),
});

const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

const CreateReportPage = () => {
  const navigate = useNavigate();
  const createReport = useReportStore((state) => state.createReport);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(reportSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      locationName: "",
      latitude: undefined,
      longitude: undefined,
      images: [],
    },
  });

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const locationName = useWatch({ control, name: "locationName" });
  const selectedImages = useWatch({ control, name: "images" });
  const safeSelectedImages = selectedImages ?? EMPTY_IMAGES;

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const updateImagePreviews = (files) => {
    setImagePreviews((currentPreviews) => {
      currentPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));

      return files.map((file) => ({
        id: fileKey(file),
        file,
        url: URL.createObjectURL(file),
      }));
    });
  };

  const handleCoordinatesChange = (nextLatitude, nextLongitude) => {
    const safeLatitude = typeof nextLatitude === "number" && Number.isFinite(nextLatitude) ? nextLatitude : undefined;
    const safeLongitude = typeof nextLongitude === "number" && Number.isFinite(nextLongitude) ? nextLongitude : undefined;

    setValue("latitude", safeLatitude, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("longitude", safeLongitude, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleLocationNameChange = (nextLocationName) => {
    setValue("locationName", nextLocationName || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async (values) => {
    setIsSubmitting(true);

    try {
      const result = await createReport(values);

      if (result.imagesUploaded) {
        showToast.success("Incident reported successfully");
      } else {
        showToast.error(`Incident reported, but ${result.imageUploadError}`);
      }

      reset();
      setImagePreviews([]);
      navigate("/citizen", { replace: true });
    } catch (error) {
      showToast.error(error?.message || "Failed to submit incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    updateImagePreviews(files);

    setValue("images", files, {
      shouldDirty: true,
      shouldValidate: true,
    });

    event.target.value = "";
  };

  const handleRemoveImage = (targetId) => {
    const nextImages = safeSelectedImages.filter((file) => fileKey(file) !== targetId);

    updateImagePreviews(nextImages);

    setValue("images", nextImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (values) => {
    void submitReport(values);
  };

  const imageCount = safeSelectedImages.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background bg-grid-pattern px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute top-[-10%] left-[-12%] h-160 w-160 rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[18%] h-144 w-xl rounded-full bg-accent/5 blur-[160px] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <header className="glass-panel card-glow overflow-hidden rounded-3xl border border-white/5 bg-background-card/80 p-6 shadow-card-glow sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <Link to="/citizen" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to dashboard
              </Link>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Submit an Incident
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Add the incident details, choose the exact coordinates on the map, and attach supporting images if available.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 shadow-inner">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
              Citizen reporting
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-start">
          <div className="space-y-6">
            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Incident details</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Provide the information that helps responders understand what happened.</p>
                </div>
              </div>

              <div className="grid gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">Title <span className="text-accent-light">*</span></span>
                  <input
                    type="text"
                    autoComplete="off"
                    {...register("title")}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    placeholder="Short incident title"
                  />
                  {errors.title ? <span className="mt-2 block text-sm text-red-300">{errors.title.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">Description <span className="text-accent-light">*</span></span>
                  <textarea
                    rows="6"
                    {...register("description")}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe what you observed, what is affected, and any immediate risks."
                  />
                  {errors.description ? <span className="mt-2 block text-sm text-red-300">{errors.description.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">Location name</span>
                  <input
                    type="text"
                    autoComplete="off"
                    {...register("locationName")}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    placeholder="Optional local place name or landmark"
                  />
                  {errors.locationName ? <span className="mt-2 block text-sm text-red-300">{errors.locationName.message}</span> : null}
                </label>
              </div>
            </section>

            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              locationName={locationName}
              latitudeError={errors.latitude?.message}
              longitudeError={errors.longitude?.message}
              onCoordinatesChange={handleCoordinatesChange}
              onLocationNameChange={handleLocationNameChange}
            />

            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Images</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Upload supporting photos.</p>
                </div>
                <Camera className="h-5 w-5 text-accent-light" aria-hidden="true" />
              </div>

              <input id="incident-images" type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />

              <label
                htmlFor="incident-images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-8 text-center transition-colors hover:border-primary/30 hover:bg-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-background-card text-primary-light shadow-glow-primary">
                  <ImagePlus className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="mt-4 text-sm font-semibold text-white">Select incident images</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">
                  Drag and drop is not required. Choose clear images that help verify the incident.
                </div>
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">Up to {MAX_IMAGES} images</span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">JPG, PNG, WebP, GIF</span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">Max 5 MB each</span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">Selected: {imageCount}</span>
              </div>

              {errors.images ? <p className="mt-4 text-sm text-red-300">{errors.images.message}</p> : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {imagePreviews.length > 0 ? (
                  imagePreviews.map((preview) => (
                    <div key={preview.id} className="overflow-hidden rounded-2xl border border-white/5 bg-white/3">
                      <div className="relative aspect-[4/3] bg-background-card/70">
                        <img src={preview.url} alt={preview.file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(preview.id)}
                          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-navy-950/80 text-white transition hover:border-red-300/40 hover:bg-red-400/20"
                          aria-label={`Remove ${preview.file.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="space-y-1 p-3">
                        <div className="truncate text-sm font-semibold text-white">{preview.file.name}</div>
                        <div className="text-xs text-slate-400">{(preview.file.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-white/5 bg-white/3 p-5 text-sm text-slate-400">
                    No images selected yet.
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Required fields are marked with <span className="text-accent-light">*</span>.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting incident..." : "Submit Incident"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <section className="glass-panel card-glow rounded-3xl border border-white/5 p-6 shadow-card-glow sm:p-7">
              <h2 className="text-xl font-semibold text-white">Submission summary</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
                  <span>Images</span>
                  <span className="text-slate-100">{imageCount}/{MAX_IMAGES}</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                The report will be created first. If image upload fails, the incident itself is still kept and you will be notified.
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CreateReportPage;