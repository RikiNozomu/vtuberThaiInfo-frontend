"use client";

import {
  ActionIcon,
  Button,
  Image,
  LoadingOverlay,
  Modal,
  ScrollArea,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import * as schema from "../../../drizzle/schema";
import { useEffect, useRef, useState } from "react";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faFileArrowUp,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { IconArrowDown, IconArrowUp, IconX } from "@tabler/icons-react";
import { alertNotification, removeItem, reorder } from "@/utils";
import { SocialSelect } from "../socialSelect";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import { AffiliateFull } from "@/types";
import { sendGTMEvent } from "@next/third-parties/google";

interface FormValues {
  id: number | null;
  name: string;
  nameHeadline: string;
  slug: string;
  profileImgURL: string | null;
  type: "AFFILIATE" | "GROUP" | "ADS";
  socials: (typeof schema.social.$inferSelect)[];
  infos: (typeof schema.info.$inferSelect)[];
}

type props = {
  affiliate?: AffiliateFull | null | undefined;
  opened: boolean;
  onClose: () => void;
};

export default function AffiliateEditModal({
  affiliate = null,
  opened,
  onClose,
}: props) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [token, setToken] = useState<string | null | undefined>(null);
  const [error, setError] = useState<boolean>(false);
  const refTurnsite = useRef<TurnstileInstance>(null);
  const [code, setCode] = useState<string | null>(null);
  const [remark, setRemark] = useState<string>("");

  const form = useForm<FormValues>({
    initialValues: {
      id: affiliate?.id || null,
      name: affiliate?.name || "",
      nameHeadline: affiliate?.nameHeadline || "",
      slug: affiliate?.slug || "",
      profileImgURL: affiliate?.profileImgURL || null,
      type: affiliate?.type || "AFFILIATE",
      socials: affiliate?.socials || [],
      infos: affiliate?.infos || [],
    },

    validate: {
      name: (value) => (value.trim().length < 1 ? true : null),
      nameHeadline: (value) => (value.trim().length < 1 ? true : null),
      socials: {
        text: (value) => ((value?.length as number) < 1 ? true : null),
        link: (value) => ((value?.length as number) < 1 ? true : null),
      },
      infos: {
        key: (value) => ((value?.length as number) < 1 ? true : null),
        value: (value) => ((value?.length as number) < 1 ? true : null),
      },
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      formData,
      file,
    }: {
      formData: typeof form.values;
      file: FileWithPath | null | undefined;
    }) => {
      if (file) {
        const resImage = await fetch("/api/upload", {
          body: JSON.stringify({
            contentType: file?.type,
          }),
          method: "POST",
        });
        if (!resImage.ok) {
          throw new Error(resImage.statusText);
        }
        const { url, filename } = await resImage.json();

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            ContentType: file.type,
            AccessControlAllowOrigin: "*",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(uploadResponse.statusText);
        }
        formData.profileImgURL =
          process.env.NEXT_PUBLIC_IMAGE_URL_BASEPATH + "/" + filename;
      }
      return fetch("/api/affiliate", {
        body: JSON.stringify({
          data: formData,
          token,
          remark,
        }),
        method: "POST",
      });
    },
    onError: () => {
      alertNotification("พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setError(false);
      setToken(null);
      refTurnsite.current?.reset();
    },
    onSuccess: async (resdata, { formData }) => {
      if (resdata.status > 299) {
        alertNotification("พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setError(false);
        setToken(null);
        refTurnsite.current?.reset();
      } else {
        sendGTMEvent({
          event: "submit-data",
          type: "affiliate",
          affiliate_id: affiliate?.id || -1,
          affiliate_name: affiliate?.name || formData.name,
          affiliate_slug: affiliate?.slug || formData.slug,
          talent_id: -1,
          talent_name: null,
          talent_slug: null,
        });
        const { code } = (await resdata.json()) as { code: string };
        setCode(code);
      }
    },
  });

  useEffect(() => {
    if (opened) {
      setFiles([]);
      setToken(null);
      setError(false);
      setCode(null);
      setRemark("");
      mutation.reset();
      form.reset();
    }
  }, [opened]);

  useEffect(() => {
    const imageUrl = files.at(0)
      ? URL.createObjectURL(files.at(0) as Blob)
      : null;
    if (imageUrl) {
      form.setFieldValue("profileImgURL", imageUrl);
    }
  }, [files]);

  const submitData = () => {
    const result = form.validate();
    if (result.hasErrors) {
      alertNotification("กรุณากรอกข้อมูลให้ครบถ้วน");
    } else {
      mutation.mutate({
        formData: {
          ...form.values,
          slug: form.values.slug || slugify(form.values.name),
        },
        file: files.length ? files.at(0) : null,
      });
    }
  };

  return (
    <Modal
      classNames={{
        title: "font-bold",
        header: "bg-primary text-white",
        close: "text-white",
        content: "flex flex-col",
        body: "flex-1 flex flex-col overflow-y-clip p-0",
      }}
      styles={{
        content: {
          border: "2px white solid",
          height: isMobile ? "100%" : "min-content",
        },
      }}
      size="xl"
      fullScreen={isMobile}
      opened={opened}
      onClose={() => {
        if (!mutation.isLoading) {
          onClose();
        }
      }}
      title={
        affiliate
          ? "แก้ไขข้อมูล " + affiliate.name
          : "สร้างข้อมูลสังกัด/กลุ่มใหม่"
      }
    >
      <ScrollArea
        className={`scroll-smooth ${isMobile ? "flex-1" : ""} p-4 flex flex-col`}
        type="scroll"
        classNames={{ scrollbar: "z-10" }}
      >
        {!code && (
          <div className="grid gap-4">
            <LoadingOverlay
              visible={mutation.isLoading}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />
            <TextInput
              className="p-4 bg-primary/20 rounded"
              label="ชื่อสังกัด/กลุ่ม"
              withAsterisk
              placeholder="กรุณาพิมพ์ชื่อย่างน้อย 1 ตัวอักษร"
              {...form.getInputProps("name")}
            />
            <TextInput
              className="p-4 bg-primary/20 rounded"
              label="ชื่อแบบสั้น"
              withAsterisk
              placeholder="กรุณาพิมพ์ชื่อย่างน้อย 1 ตัวอักษร"
              {...form.getInputProps("nameHeadline")}
            />
            <div className="p-4 bg-primary/20 flex flex-col text-sm rounded relative items-center gap-2">
              <label className="w-full">รูปภาพ</label>
              <div className="relative text-center">
                <Dropzone
                  className="w-full transition-opacity max-w-[200px] absolute left-[50%] top-0 bg-primary/50 aspect-square -translate-x-[50%] rounded-xl flex justify-center items-center hover:opacity-100 opacity-0 hover:cursor-pointer"
                  accept={IMAGE_MIME_TYPE}
                  onDrop={setFiles}
                  maxSize={1024 * 1024 * 2}
                >
                  <FontAwesomeIcon
                    className="text-white"
                    size="4x"
                    icon={faFileArrowUp}
                  />
                </Dropzone>
                <Image
                  className="rounded-xl object-cover max-w-[200px] aspect-square bg-white"
                  src={form.values.profileImgURL}
                  fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                />
                <div className="pt-2">(Max size : 2MB)</div>
              </div>
              <Button
                disabled={form.values?.profileImgURL ? false : true}
                onClick={() => {
                  setFiles([]);
                  form.setFieldValue("profileImgURL", "");
                }}
                className="bg-primary disabled:opacity-50"
                variant="filled"
              >
                ลบรูป
              </Button>
            </div>
            <div className="p-3 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>ข้อมูล</span>
              {form.values.infos.length > 0 && (
                <div className="grid gap-4">
                  {form.values.infos.map((item, index) => (
                    <div
                      className={`flex flex-row gap-2 items-center rounded bg-white p-2`}
                      key={index}
                    >
                      <div className="flex flex-col gap-2">
                        <ActionIcon
                          disabled={index ? false : true}
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "infos",
                              reorder(form.values.infos, index, index - 1)
                            )
                          }
                        >
                          <IconArrowUp stroke={2.5} />
                        </ActionIcon>
                        <ActionIcon
                          disabled={
                            index + 1 == form.values.infos.length ? true : false
                          }
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "infos",
                              reorder(form.values.infos, index, index + 1)
                            )
                          }
                        >
                          <IconArrowDown stroke={2.5} />
                        </ActionIcon>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 flex-1">
                        <TextInput
                          error={form.errors["infos." + index + ".key"]}
                          placeholder="หัวข้อ"
                          value={item?.key || ""}
                          onChange={(e) =>
                            form.setFieldValue(
                              "infos." + index + ".key",
                              e.target.value
                            )
                          }
                        />
                        <TextInput
                          error={form.errors["infos." + index + ".value"]}
                          placeholder="ข้อมูล"
                          value={item?.value || ""}
                          onChange={(e) =>
                            form.setFieldValue(
                              "infos." + index + ".value",
                              e.target.value
                            )
                          }
                        />
                        <TextInput
                          className="md:col-span-2"
                          value={item?.link || ""}
                          placeholder="ลิงค์(ถ้ามี)"
                          onChange={(e) =>
                            form.setFieldValue(
                              "infos." + index + ".link",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue(
                            "infos",
                            removeItem(form.values.infos, index)
                          )
                        }
                        variant="transparent"
                      >
                        <IconX style={{ width: 24, height: 24 }} stroke={1.5} />
                      </ActionIcon>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() =>
                  form.setFieldValue("infos", [
                    ...form.values.infos,
                    {
                      id: -1,
                      talentId: null,
                      value: "",
                      link: "",
                      affiliateId: affiliate?.id || -1,
                      key: "",
                    },
                  ])
                }
                className="bg-primary hover:brightness-75"
                leftSection={<FontAwesomeIcon icon={faPlus} />}
              >
                เพิ่ม
              </Button>
            </div>
            <div className="p-3 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>โซเชียลมีเดีย</span>
              {form.values.socials.length > 0 && (
                <div className="grid gap-4">
                  {form.values.socials.map((item, index) => (
                    <div
                      className={`flex flex-row gap-2 items-center rounded bg-white p-2`}
                      key={index}
                    >
                      <div className="flex flex-col gap-2">
                        <ActionIcon
                          disabled={index ? false : true}
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "socials",
                              reorder(form.values.socials, index, index - 1)
                            )
                          }
                        >
                          <IconArrowUp stroke={2.5} />
                        </ActionIcon>
                        <ActionIcon
                          disabled={
                            index + 1 == form.values.socials.length
                              ? true
                              : false
                          }
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "socials",
                              reorder(form.values.socials, index, index + 1)
                            )
                          }
                        >
                          <IconArrowDown stroke={2.5} />
                        </ActionIcon>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 flex-1">
                        <TextInput
                          classNames={{ section: "w-fit", input: "pl-12" }}
                          leftSection={
                            <SocialSelect
                              value={item.platform || ""}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "socials." + index + ".platform",
                                  value
                                )
                              }
                            />
                          }
                          placeholder="หัวข้อ"
                          value={item.text || ""}
                          onChange={(e) =>
                            form.setFieldValue(
                              "socials." + index + ".text",
                              e.target.value
                            )
                          }
                        />
                        <TextInput
                          placeholder="ลิงค์"
                          value={item.link || ""}
                          onChange={(e) =>
                            form.setFieldValue(
                              "socials." + index + ".link",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue(
                            "socials",
                            removeItem(form.values.socials, index)
                          )
                        }
                        variant="transparent"
                      >
                        <IconX style={{ width: 24, height: 24 }} stroke={1.5} />
                      </ActionIcon>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() =>
                  form.setFieldValue("socials", [
                    ...form.values.socials,
                    {
                      id: -1,
                      text: "",
                      platform: "WWW",
                      link: "",
                      talentId: null,
                      affiliateId: affiliate?.id || -1,
                    },
                  ])
                }
                className="bg-primary hover:brightness-75"
                leftSection={<FontAwesomeIcon icon={faPlus} />}
              >
                เพิ่ม
              </Button>
            </div>
            <Textarea
              label="หมายเหตุ"
              description={`(${remark.length}/500 ตัวอักษร)`}
              placeholder="(Optional)"
              autosize
              minRows={8}
              maxRows={8}
              value={remark}
              onChange={(event) =>
                setRemark(
                  event.currentTarget.value.length > 500
                    ? remark
                    : event.currentTarget.value
                )
              }
            />
          </div>
        )}
        {code && (
          <div className="flex flex-col justify-center items-center text-center gap-4">
            <b className="text-lg">ได้รับข้อมูลเรียบร้อยแล้ว</b>
            <span>ทางทีมงานจะรีบนำข้อมูลที่ได้รับ นำไปปรับปรุงต่อไป</span>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 bg-primary/20 flex flex-row items-center">
        {!code && (
          <Turnstile
            ref={refTurnsite}
            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY || ""}
            onError={() => setError(true)}
            onExpire={() => setError(true)}
            onSuccess={(token) => {
              setToken(token);
              setError(false);
            }}
          />
        )}
        <div className="flex-1" />
        {error && !code && (
          <Button
            variant="filled"
            className="bg-red-500 text-white"
            onClick={() => {
              setError(false);
              refTurnsite.current?.reset();
            }}
          >
            พบเจอปัญหา กรุณากดปุ่มนี้เพื่อลองใหม่
          </Button>
        )}
        {token && !code && (
          <Button
            className="bg-primary"
            disabled={token && form.isDirty() ? false : true}
            onClick={() => submitData()}
            variant="filled"
          >
            ส่งข้อมูล
          </Button>
        )}
      </div>
    </Modal>
  );
}
