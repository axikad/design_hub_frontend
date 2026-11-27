import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileArchive,
  Image as ImageIcon,
  Layers3,
  LoaderCircle,
  Plus,
  ReceiptIndianRupee,
  Save,
  Tag,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StudioNavigation } from "../../components/studio/StudioNavigation";
import { useApp } from "../../context/AppContext";
import { ApiError, getErrorMessage, studioApi } from "../../lib/api-client";
import { normalizeAssetUrl } from "../../lib/marketplace-mappers";
import type { ApiDesign, ApiImage } from "../../types/marketplace";
import type {
  DesignFormConfig,
  DesignOptionItem,
  DesignOptions,
  PricingPreview,
} from "../../types/studio";

type VariantValue = string | number;
interface VariantForm {
  key: string;
  typeId: string | null;
  customTypeName: string;
  typeName: string;
  specificationMode: 'design_property' | 'technical';
  nameOrNumber: string;
  stitchCount: VariantValue;
  needle: VariantValue;
  area: VariantValue;
  height: VariantValue;
  width: VariantValue;
  imageFile: File | null;
  existingImage: {
    name: string;
    uri: string;
    thumbnailUri?: string | null;
  } | null;
  removeImage: boolean;
}

const money = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const defaultSpecificationMode = (
  config: DesignFormConfig | null,
): VariantForm['specificationMode'] =>
  config?.specificationModes.technicalSpecifications
    ? 'technical'
    : 'design_property';
const emptyVariant = (
  type: DesignOptionItem,
  specificationMode: VariantForm['specificationMode'] = 'technical',
): VariantForm => ({
  key: `type:${type.id}`,
  typeId: type.id,
  customTypeName: "",
  typeName: type.name,
  specificationMode,
  nameOrNumber: "",
  stitchCount: "",
  needle: "",
  area: "",
  height: "",
  width: "",
  imageFile: null,
  existingImage: null,
  removeImage: false,
});
const numericValue = (value: VariantValue) =>
  value === "" ? undefined : Number(value);

export const AddEditDesignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const isEdit = Boolean(id);
  const [options, setOptions] = useState<DesignOptions | null>(null);
  const [designTypes, setDesignTypes] = useState<DesignOptionItem[]>([]);
  const [fileTypes, setFileTypes] = useState<DesignOptionItem[]>([]);
  const [existingDesign, setExistingDesign] = useState<ApiDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [machineId, setMachineId] = useState("");
  const [machineTypeId, setMachineTypeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [activeVariantKey, setActiveVariantKey] = useState("");
  const [customType, setCustomType] = useState("");
  const [sequenceType, setSequenceType] = useState<VariantValue>("");
  const [designFileTypeId, setDesignFileTypeId] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [stitchFiles, setStitchFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ApiImage[]>([]);
  const [existingFiles, setExistingFiles] = useState<ApiDesign["files"]>([]);
  const [pricing, setPricing] = useState<PricingPreview | null>(null);

  const machine = useMemo(
    () => options?.machines.find((item) => item.id === machineId) ?? null,
    [machineId, options],
  );
  const config: DesignFormConfig | null = machine?.designFormConfig ?? null;
  const specificationMode =
    variants[0]?.specificationMode ?? defaultSpecificationMode(config);
  const machineTypes = useMemo(
    () =>
      options?.machineTypes.filter((item) =>
        machine?.machineTypeIds.includes(item.id),
      ) ?? [],
    [machine, options],
  );
  const categories = useMemo(() => {
    const all = options?.categories ?? [];
    if (machineTypeId)
      return all.filter((item) => item.machineTypeIds?.includes(machineTypeId));
    return all.filter((item) => machine?.categoryIds.includes(item.id));
  }, [machine, machineTypeId, options]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const [optionResponse, designResponse] = await Promise.all([
          studioApi.designOptions(controller.signal),
          id ? studioApi.design(id, controller.signal) : Promise.resolve(null),
        ]);
        if (controller.signal.aborted) return;
        setOptions(optionResponse.data);
        const design = designResponse?.data ?? null;
        setExistingDesign(design);
        const initialMachine =
          design?.machineId || optionResponse.data.machines[0]?.id || "";
        setMachineId(initialMachine);
        setMachineTypeId(design?.machineTypeId || "");
        setCategoryId(design?.categoryId || "");
        setTitle(design?.title || "");
        setSequenceType(design?.sequenceType || "");
        setDesignFileTypeId(design?.designFileTypeId || "");
        setPriceRupees(design?.pricePaise != null ? String(design.pricePaise / 100) : "");
        setExistingImages(design?.images ?? []);
        setExistingFiles(design?.files ?? []);
        const loadedMachine = optionResponse.data.machines.find(
          (item) => item.id === initialMachine,
        );
        const loadedSpecificationMode =
          design?.designTypes?.[0]?.specificationMode ||
          defaultSpecificationMode(loadedMachine?.designFormConfig ?? null);
        const loadedVariants = (design?.designTypes ?? []).map(
          (item, index) => ({
            key: item.typeId
              ? `type:${item.typeId}`
              : `custom:${item.customTypeName || index}`,
            typeId: item.typeId,
            customTypeName: item.customTypeName || "",
            typeName: item.typeName || item.customTypeName || "Custom type",
            specificationMode: loadedSpecificationMode,
            nameOrNumber: item.details.nameOrNumber || "",
            stitchCount: item.details.stitchCount ?? "",
            needle: item.details.needle ?? "",
            area: item.details.area ?? "",
            height: item.details.height ?? "",
            width: item.details.width ?? "",
            imageFile: null,
            existingImage: item.details.image,
            removeImage: false,
          }),
        );
        setVariants(loadedVariants);
        setActiveVariantKey(loadedVariants[0]?.key ?? "");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        showToast(
          "Could not open design form",
          getErrorMessage(error),
          "error",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [id, showToast]);

  useEffect(() => {
    if (!categoryId) {
      setDesignTypes([]);
      return;
    }
    const controller = new AbortController();
    studioApi
      .categoryTypes(categoryId, controller.signal)
      .then((response) => setDesignTypes(response.data))
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          showToast(
            "Could not load design types",
            getErrorMessage(error),
            "error",
          );
        }
      });
    return () => controller.abort();
  }, [categoryId, showToast]);

  useEffect(() => {
    if (!machineId) {
      setFileTypes([]);
      return;
    }
    const controller = new AbortController();
    studioApi
      .machineFileTypes(machineId, controller.signal)
      .then((response) => setFileTypes(response.data))
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          showToast(
            "Could not load file types",
            getErrorMessage(error),
            "error",
          );
        }
      });
    return () => controller.abort();
  }, [machineId, showToast]);

  useEffect(() => {
    const numericPrice = Number(priceRupees);
    if (!config?.pricing || priceRupees.trim() === "" || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setPricing(null);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      studioApi
        .pricingPreview(
          Math.round(numericPrice * 100),
          controller.signal,
        )
        .then((response) => setPricing(response.data))
        .catch(() => setPricing(null));
    }, 300);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [config?.pricing, priceRupees]);

  const selectMachine = (value: string) => {
    setMachineId(value);
    setMachineTypeId("");
    setCategoryId("");
    setVariants([]);
    setActiveVariantKey("");
    setDesignFileTypeId("");
    setFieldErrors({});
  };
  const selectMachineType = (value: string) => {
    setMachineTypeId(value);
    setCategoryId("");
    setVariants([]);
    setActiveVariantKey("");
  };
  const selectCategory = (value: string) => {
    setCategoryId(value);
    setVariants([]);
    setActiveVariantKey("");
  };
  const toggleType = (type: DesignOptionItem) => {
    const existing = variants.find((item) => item.typeId === type.id);
    if (existing && activeVariantKey !== existing.key) {
      setActiveVariantKey(existing.key);
      return;
    }
    if (existing) {
      const removedIndex = variants.findIndex(
        (item) => item.key === existing.key,
      );
      const next = variants.filter((item) => item.key !== existing.key);
      setVariants(next);
      setActiveVariantKey(next[Math.max(0, removedIndex - 1)]?.key ?? "");
      return;
    }
    const nextVariant = emptyVariant(type, specificationMode);
    setVariants((current) => [...current, nextVariant]);
    setActiveVariantKey(nextVariant.key);
  };
  const addCustomType = () => {
    const value = customType.trim();
    if (!value) return;
    const key = `custom:${value.toLowerCase()}`;
    if (variants.some((item) => item.key === key)) return;
    const nextVariant = {
      ...emptyVariant(
        { id: key, name: value },
        specificationMode,
      ),
      key,
      typeId: null,
      customTypeName: value,
    };
    setVariants((current) => [...current, nextVariant]);
    setActiveVariantKey(nextVariant.key);
    setCustomType("");
  };
  const removeVariant = (key: string) => {
    const removedIndex = variants.findIndex((item) => item.key === key);
    const next = variants.filter((item) => item.key !== key);
    setVariants(next);
    if (activeVariantKey === key)
      setActiveVariantKey(next[Math.max(0, removedIndex - 1)]?.key ?? "");
  };
  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setVariants((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };
  const updateSpecificationMode = (mode: VariantForm["specificationMode"]) => {
    setVariants((current) =>
      current.map((item) => ({ ...item, specificationMode: mode })),
    );
  };
  const firstError = (prefix: string) =>
    Object.entries(fieldErrors).find(
      ([key]) => key === prefix || key.startsWith(`${prefix}.`),
    )?.[1]?.[0];

  const uploadFiles = async (files: File[]) =>
    Promise.all(
      files.map(async (file) => {
        const response = await studioApi.upload(file);
        return { name: file.name, uri: response.data.url };
      }),
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!config || submitting) return;
    setSubmitting(true);
    setFieldErrors({});
    try {
      const images =
        previewFiles.length > 0
          ? await uploadFiles(previewFiles)
          : existingImages.map((image) => ({
              name: image.name,
              uri: image.sourceUri || image.uri,
            }));
      const files =
        stitchFiles.length > 0
          ? await uploadFiles(stitchFiles)
          : existingFiles
              .filter((file) => file.uri)
              .map((file) => ({ name: file.name, uri: file.uri as string }));
      const designTypePayload = await Promise.all(
        variants.map(async (variant) => {
          const details: Record<string, unknown> = {};
          const fields = config.specificationFields;
          if (fields.nameOrNumber && variant.nameOrNumber !== "")
            details.nameOrNumber = variant.nameOrNumber;
          if (variant.specificationMode === "technical" && fields.stitchCount && variant.stitchCount !== "")
            details.stitchCount = numericValue(variant.stitchCount);
          if (variant.specificationMode === "technical" && fields.needle && variant.needle !== "")
            details.needle = numericValue(variant.needle);
          if (variant.specificationMode === "technical" && fields.area && variant.area !== "")
            details.area = numericValue(variant.area);
          if (variant.specificationMode === "technical" && fields.height && variant.height !== "")
            details.height = numericValue(variant.height);
          if (variant.specificationMode === "technical" && fields.width && variant.width !== "")
            details.width = numericValue(variant.width);
          if (variant.specificationMode === "design_property" && fields.image && variant.imageFile) {
            const [uploaded] = await uploadFiles([variant.imageFile]);
            details.image = uploaded;
          } else if (variant.specificationMode === "design_property" && fields.image && variant.removeImage) {
            details.removeImage = true;
          }
          return {
            ...(variant.typeId
              ? { typeId: variant.typeId }
              : { customTypeName: variant.customTypeName }),
            specificationMode: variant.specificationMode,
            ...(config.designSpecifications ? { details } : {}),
          };
        }),
      );

      const payload: Record<string, unknown> = { machineId };
      if (config.machineType) payload.machineTypeId = machineTypeId || null;
      if (config.category) payload.categoryId = categoryId || null;
      if (config.title) payload.title = title.trim();
      if (config.designTypes) payload.designTypes = designTypePayload;
      if (config.sequenceType && sequenceType !== "")
        payload.sequenceType = Number(sequenceType);
      if (config.designFileType)
        payload.designFileTypeId = designFileTypeId || null;
      if (config.previewImages) payload.images = images;
      if (config.stitchFiles) payload.files = files;
      if (config.pricing) {
        payload.pricePaise = Math.round(Number(priceRupees || 0) * 100);
        payload.showPrice = true;
      }

      const response = id
        ? await studioApi.updateDesign(id, payload)
        : await studioApi.createDesign(payload);
      showToast(
        id ? "Design updated" : "Design published",
        `“${response.data.title}” is saved in your studio.`,
        "success",
      );
      navigate("/studio/designs");
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {});
        const firstVariantError = Object.keys(error.errors ?? {}).find((key) =>
          /^designTypes\.\d+\./.test(key),
        );
        const errorIndex = firstVariantError
          ? Number(firstVariantError.split(".")[1])
          : -1;
        if (errorIndex >= 0 && variants[errorIndex])
          setActiveVariantKey(variants[errorIndex].key);
        const detail = error.errors
          ? Object.values(error.errors).flat()[0]
          : error.message;
        showToast(
          "Design could not be saved",
          detail || error.message,
          "error",
        );
      } else {
        showToast("Design could not be saved", getErrorMessage(error), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !options || !config) {
    return (
      <main className="min-h-screen bg-[#FAF8F5]">
        <StudioNavigation />
        <div className="flex min-h-[50vh] items-center justify-center text-stone-500">
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading design
          form…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24">
      <StudioNavigation />
      <header className="border-b border-stone-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/studio/designs"
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Creator studio
              </p>
              <h1 className="font-serif text-2xl font-semibold text-stone-950">
                {isEdit ? "Edit design" : "Add design"}
              </h1>
            </div>
          </div>
          {existingDesign && (
            <Link
              to={`/design/${existingDesign.id}`}
              className="text-sm font-semibold text-amber-900 hover:underline"
            >
              Public preview
            </Link>
          )}
        </div>
      </header>

      <form
        onSubmit={(event) => void submit(event)}
        className="mx-auto max-w-4xl space-y-5 px-4 pt-8 sm:px-6"
      >
        {config.title && (
          <FormPanel
            title="Design details"
            description="Enter the enabled details for this marketplace design."
            icon={UserRound}
          >
            <label className="block max-w-xl text-sm font-semibold text-stone-700">
              Title {config.required.title && <RequiredMark />}
              <input
                required={config.required.title}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Enter design title"
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-amber-700"
              />
              <FieldError message={firstError("title")} />
            </label>
          </FormPanel>
        )}

        <FormPanel
          title="Catalog classification"
          description="Selections are linked: Machine → Machine Type → Category → Design Type."
          icon={Layers3}
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="text-sm font-semibold text-stone-700">
              Machine <RequiredMark />
              <select
                required
                value={machineId}
                onChange={(event) => selectMachine(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-amber-700"
              >
                {options.machines.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <FieldError message={firstError("machineId")} />
            </label>
            {config.machineType && (
              <label className="text-sm font-semibold text-stone-700">
                Machine type {config.required.machineType && <RequiredMark />}
                <select
                  required={config.required.machineType}
                  value={machineTypeId}
                  onChange={(event) => selectMachineType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-amber-700"
                >
                  <option value="">Select machine type</option>
                  {machineTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <FieldError message={firstError("machineTypeId")} />
              </label>
            )}
            {config.category && (
              <label className="text-sm font-semibold text-stone-700">
                Category {config.required.category && <RequiredMark />}
                <select
                  required={config.required.category}
                  value={categoryId}
                  onChange={(event) => selectCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-amber-700"
                >
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <FieldError message={firstError("categoryId")} />
              </label>
            )}
          </div>
          {config.designTypes && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-stone-700">
                Design types {config.required.designTypes && <RequiredMark />}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Select every type included in this design. Click a selected type
                to open its specifications.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {designTypes.map((type) => {
                  const variant = variants.find(
                    (item) => item.typeId === type.id,
                  );
                  const active = variant?.key === activeVariantKey;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-stone-950 bg-stone-950 text-white shadow-sm" : variant ? "border-amber-700 bg-amber-50 text-amber-950" : "border-stone-300 bg-white text-stone-700 hover:border-amber-700"}`}
                    >
                      {type.name}
                    </button>
                  );
                })}
              </div>
              {variants.some((item) => !item.typeId) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {variants
                    .filter((item) => !item.typeId)
                    .map((variant) => (
                      <button
                        key={variant.key}
                        type="button"
                        onClick={() =>
                          activeVariantKey === variant.key
                            ? removeVariant(variant.key)
                            : setActiveVariantKey(variant.key)
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeVariantKey === variant.key ? "border-stone-950 bg-stone-950 text-white shadow-sm" : "border-amber-700 bg-amber-50 text-amber-950"}`}
                      >
                        {variant.customTypeName}
                      </button>
                    ))}
                </div>
              )}
              <div className="mt-4 flex max-w-lg gap-2">
                <input
                  value={customType}
                  onChange={(event) => setCustomType(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomType();
                    }
                  }}
                  placeholder="Optional custom type"
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-amber-700"
                />
                <button
                  type="button"
                  onClick={addCustomType}
                  className="inline-flex items-center rounded-xl border border-stone-300 px-4 text-sm font-semibold hover:border-amber-700"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add custom
                </button>
              </div>
              <FieldError message={firstError("designTypes")} />
            </div>
          )}
        </FormPanel>

        {config.designSpecifications && variants.length > 0 && (
          <>
            {config.specificationModes.designProperty &&
            config.specificationModes.technicalSpecifications ? (
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={specificationMode === "design_property"}
                    aria-label="Use design property mode"
                    onClick={() =>
                      updateSpecificationMode(
                        specificationMode === "design_property"
                          ? "technical"
                          : "design_property",
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${specificationMode === "design_property" ? "bg-amber-700" : "bg-stone-300"}`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${specificationMode === "design_property" ? "left-6" : "left-1"}`}
                    />
                  </button>
                  <span>Design property</span>
                </div>
              </div>
            ) : null}
            <FormPanel
              title="Design type specifications"
              description="Enter specifications and one image for every catalog or custom design type."
              icon={Layers3}
            >
              {variants.map((variant, index) =>
                variant.key === activeVariantKey ? (
                  <VariantCard
                    key={variant.key}
                    index={index}
                    value={variant}
                    config={config}
                    error={firstError(`designTypes.${index}`)}
                    onChange={(patch) => updateVariant(index, patch)}
                    onRemove={() => removeVariant(variant.key)}
                  />
                ) : null,
              )}
            </FormPanel>
          </>
        )}

        {config.sequenceType && (
          <FormPanel
            title="Design measurement"
            description="This sequence value applies once to the complete design."
            icon={Layers3}
          >
            <label className="block max-w-xs text-sm font-semibold text-stone-700">
              Sequence type {config.required.sequenceType && <RequiredMark />}
              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required={config.required.sequenceType}
                  value={sequenceType}
                  onChange={(event) => setSequenceType(event.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 pr-14 font-normal outline-none focus:border-amber-700"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center border-l border-stone-200 px-3 text-sm text-stone-500">
                  mm
                </span>
              </div>
              <FieldError message={firstError("sequenceType")} />
            </label>
          </FormPanel>
        )}

        {(config.pricing || config.designFileType) && (
          <FormPanel
            title="Pricing and format"
            description="Set the enabled marketplace pricing and format fields."
            icon={Tag}
          >
            <div className="grid items-start gap-5 sm:grid-cols-2">
              {config.pricing && (
                <div>
                  <label className="text-sm font-semibold text-stone-700">
                    Selling price (INR) {config.required.pricing && <RequiredMark />}
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required={config.required.pricing}
                      value={priceRupees}
                      onChange={(event) => setPriceRupees(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-mono font-normal outline-none focus:border-amber-700"
                    />
                    <FieldError message={firstError("pricePaise")} />
                  </label>
                  {pricing && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-bold text-stone-900">
                          <ReceiptIndianRupee className="h-4 w-4 text-amber-700" />
                          Estimated seller earnings
                        </div>
                        {pricing.isTestMode && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-700 uppercase">Test mode</span>
                        )}
                      </div>
                      <dl className="mt-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-stone-500">Selling price</dt>
                          <dd className="font-mono font-semibold">{money(pricing.itemPricePaise)}</dd>
                        </div>
                        {pricing.taxes.buyerGst.enabled && (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-stone-500">GST charged to buyer ({pricing.taxes.buyerGst.percent}%)</dt>
                            <dd className="font-mono font-semibold">+{money(pricing.taxes.buyerGst.amountPaise)}</dd>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <dt className="font-medium text-stone-700">Buyer will pay</dt>
                          <dd className="font-mono font-semibold">{money(pricing.buyerPayablePaise)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-stone-500">Platform commission ({pricing.platformCommission.percent}%)</dt>
                          <dd className="font-mono font-semibold text-rose-700">-{money(pricing.platformCommission.amountPaise)}</dd>
                        </div>
                        {pricing.taxes.commissionGst.enabled && (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-stone-500">GST on platform commission ({pricing.taxes.commissionGst.percent}%)</dt>
                            <dd className="font-mono font-semibold text-rose-700">-{money(pricing.taxes.commissionGst.amountPaise)}</dd>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-stone-500">Seller earning before buyer GST</dt>
                          <dd className="font-mono font-semibold">{money(pricing.sellerGrossPaise)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-amber-200 pt-2">
                          <dt className="font-bold text-stone-800">Estimated wallet credit</dt>
                          <dd className="font-mono text-base font-bold text-emerald-700">{money(pricing.estimatedSellerEarningPaise)}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-[10px] leading-4 text-stone-500">
                        Estimate only. Final amounts and tax details are saved when the buyer pays.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {config.designFileType && (
                <div className="self-start">
                  <label className="text-sm font-semibold text-stone-700">
                    Design file type {config.required.designFileType && <RequiredMark />}
                    <select
                      required={config.required.designFileType}
                      value={designFileTypeId}
                      onChange={(event) => setDesignFileTypeId(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-amber-700"
                    >
                      <option value="">Select file type</option>
                      {fileTypes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}{item.extension ? ` (.${item.extension})` : ""}
                        </option>
                      ))}
                    </select>
                    <FieldError message={firstError("designFileTypeId")} />
                    {!fileTypes.length && (
                      <span className="mt-2 block text-xs font-normal text-amber-700">No active file type is connected to this machine.</span>
                    )}
                  </label>
                </div>
              )}
            </div>
          </FormPanel>
        )}

        {(config.previewImages || config.stitchFiles) && (
          <div className="grid gap-5 lg:grid-cols-2">
            {config.previewImages && (
              <FormPanel
                title="Preview images"
                description={
                  isEdit
                    ? "Select new images only when you want to replace all current preview images."
                    : "Upload marketplace preview images."
                }
                icon={ImageIcon}
              >
                <UploadField
                  label="Choose preview images"
                  required={
                    config.required.previewImages && existingImages.length === 0
                  }
                  multiple
                  accept="image/*"
                  files={previewFiles}
                  existing={existingImages.map((item) => item.name)}
                  existingPreviews={existingImages
                    .map((item) => ({
                      name: item.name,
                      src: normalizeAssetUrl(item.thumbnailUri || item.uri),
                    }))
                    .filter((item): item is { name: string; src: string } =>
                      Boolean(item.src),
                    )}
                  onChange={setPreviewFiles}
                  hint={
                    previewFiles.length
                      ? "New images will replace the current preview set."
                      : "Marketplace images shown before purchase."
                  }
                  error={firstError("images") || firstError("imageUri")}
                />
              </FormPanel>
            )}
            {config.stitchFiles && (
              <FormPanel
                title="Stitch files"
                description={
                  isEdit
                    ? "Select new files only when you want to replace all current stitch files."
                    : "Upload downloadable machine files."
                }
                icon={FileArchive}
              >
                <UploadField
                  label="Choose stitch files"
                  required={
                    config.required.stitchFiles && existingFiles.length === 0
                  }
                  multiple
                  files={stitchFiles}
                  existing={existingFiles.map((item) => item.name)}
                  onChange={setStitchFiles}
                  hint={
                    stitchFiles.length
                      ? "New files will replace the current stitch-file set."
                      : "Buyers receive these protected files after purchase."
                  }
                  error={firstError("files") || firstError("fileUri")}
                />
              </FormPanel>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pb-2">
          <Link
            to="/studio/designs"
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitting
              ? "Uploading and saving…"
              : isEdit
                ? "Save changes"
                : "Create design"}
          </button>
        </div>
      </form>
    </main>
  );
};

const FormPanel = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
    <div className="flex items-start gap-3 border-b border-stone-100 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-stone-950">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
        )}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span className="mt-1 block text-xs font-normal text-rose-700">
      {message}
    </span>
  ) : null;

const RequiredMark = () => (
  <span className="text-rose-600" aria-hidden="true">
    *
  </span>
);

const UploadField = ({
  label,
  required,
  multiple,
  accept,
  files,
  existing,
  existingPreviews = [],
  onChange,
  hint,
  error,
}: {
  label: string;
  required: boolean;
  multiple?: boolean;
  accept?: string;
  files: File[];
  existing: string[];
  existingPreviews?: Array<{ name: string; src: string }>;
  onChange: (files: File[]) => void;
  hint: string;
  error?: string;
}) => (
  <div>
    {existingPreviews.length > 0 && files.length === 0 && (
      <div className="mb-4 grid grid-cols-3 gap-2">
        {existingPreviews.map((item, index) => (
          <div key={`${item.name}-${index}`} className="min-w-0">
            <img
              src={item.src}
              alt={item.name}
              className="h-20 w-full rounded-xl border border-stone-200 object-cover"
            />
            <p
              className="mt-1 truncate text-[10px] text-stone-500"
              title={item.name}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
    )}
    <label className="block cursor-pointer rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center transition hover:border-amber-600 hover:bg-amber-50/30">
      <UploadCloud className="mx-auto h-6 w-6 text-amber-800" />
      <span className="mt-2 block text-sm font-semibold text-stone-800">
        {label} {required && <RequiredMark />}
      </span>
      <span className="mt-1 block break-words text-xs text-stone-500">
        {files.length
          ? files.map((file) => file.name).join(", ")
          : existing.length
            ? `Current: ${existing.join(", ")}`
            : "Choose files"}
      </span>
      <span className="mt-2 block text-[11px] text-stone-400">{hint}</span>
      <FieldError message={error} />
      <input
        type="file"
        required={required}
        multiple={multiple}
        accept={accept}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        className="sr-only"
      />
    </label>
  </div>
);

const VariantCard = ({
  index,
  value,
  config,
  error,
  onChange,
  onRemove,
}: {
  index: number;
  value: VariantForm;
  config: DesignFormConfig;
  error?: string;
  onChange: (patch: Partial<VariantForm>) => void;
  onRemove: () => void;
}) => {
  const fields = config.specificationFields;
  const [filePreview, setFilePreview] = useState<string | null>(null);
  useEffect(() => {
    if (!value.imageFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(value.imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value.imageFile]);
  const imagePreview =
    filePreview ||
    value.existingImage?.thumbnailUri ||
    value.existingImage?.uri;
  return (
    <article className="rounded-xl border border-stone-200 bg-stone-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-400">
            Type {index + 1}
          </p>
          <h3 className="font-serif text-lg font-semibold text-stone-950">
            {value.typeName}
          </h3>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-700"
          aria-label={`Remove ${value.typeName}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {config.designSpecifications && (
        <div className="mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
          {fields.nameOrNumber && (
            <SpecInput
              label="Name or number"
              required={fields.required.nameOrNumber}
              value={value.nameOrNumber}
              onChange={(next) => onChange({ nameOrNumber: next })}
            />
          )}
          {value.specificationMode === "technical" && fields.stitchCount && (
            <SpecInput
              label="Stitch count"
              type="number"
              required={fields.required.stitchCount}
              value={value.stitchCount}
              onChange={(next) => onChange({ stitchCount: next })}
            />
          )}
          {value.specificationMode === "technical" && fields.needle && (
            <SpecInput
              label="Needle"
              type="number"
              required={fields.required.needle}
              value={value.needle}
              onChange={(next) => onChange({ needle: next })}
            />
          )}
          {value.specificationMode === "technical" && fields.area && (
            <SpecInput
              label="Area (mm)"
              type="number"
              step="0.01"
              required={fields.required.area}
              value={value.area}
              onChange={(next) => onChange({ area: next })}
            />
          )}
          {value.specificationMode === "technical" && fields.height && (
            <SpecInput
              label="Height (mm)"
              type="number"
              step="0.01"
              required={fields.required.height}
              value={value.height}
              onChange={(next) => onChange({ height: next })}
            />
          )}
          {value.specificationMode === "technical" && fields.width && (
            <SpecInput
              label="Width (mm)"
              type="number"
              step="0.01"
              required={fields.required.width}
              value={value.width}
              onChange={(next) => onChange({ width: next })}
            />
          )}
          {value.specificationMode === "design_property" && fields.image && (
            <div className="sm:col-span-3">
              <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
                {imagePreview && !value.removeImage ? (
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-24 w-24 rounded-lg border border-stone-200 object-cover"
                  />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-lg bg-stone-100">
                    <ImageIcon className="h-6 w-6 text-stone-400" />
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">
                    Design property <RequiredMark />
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {value.imageFile?.name ||
                      value.existingImage?.name ||
                      "No image selected"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg bg-stone-950 px-3 py-2 text-xs font-semibold text-white">
                      {value.existingImage || value.imageFile
                        ? "Replace image"
                        : "Select image"}
                      <input
                        type="file"
                        accept="image/*"
                        required={!value.existingImage}
                        onChange={(event) =>
                          onChange({
                            imageFile: event.target.files?.[0] || null,
                            removeImage: false,
                          })
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
      <FieldError message={error} />
    </article>
  );
};

const SpecInput = ({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
}: {
  label: string;
  value: VariantValue;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  required: boolean;
}) => (
  <label className="text-sm font-semibold text-stone-700">
    {label} {required && <RequiredMark />}
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      step={step}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-amber-700"
    />
  </label>
);
