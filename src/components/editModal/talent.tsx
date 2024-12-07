"use client";

import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  NumberInput,
  Radio,
  ScrollArea,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileArrowUp,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  IconArrowDown,
  IconArrowUp,
  IconHash,
  IconX,
} from "@tabler/icons-react";
import {
  alertNotification,
  convertTimelineType,
  getTalentImageUrl,
  removeItem,
  reorder,
} from "@/utils";
import { SocialSelect } from "../socialSelect";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import { AffiliateFull, TalentFull, TalentWithChannel } from "@/types";
import { Info } from "luxon";
import { Editor } from "../editor";
import { AffiliateSingleSelect } from "../affiliateSelectOneOnly";
import { faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { sendGTMEvent } from "@next/third-parties/google";

type props = {
  talent?: TalentFull | null | undefined;
  opened: boolean;
  onClose: () => void;
  affiliates: AffiliateFull[];
};

const dayInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default function TalentEditModal({
  talent = null,
  opened,
  onClose,
  affiliates = [],
}: props) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [token, setToken] = useState<string | null | undefined>(null);
  const [error, setError] = useState<boolean>(false);
  const refTurnsite = useRef<TurnstileInstance>(null);
  const [code, setCode] = useState<string | null>(null);
  const [remark, setRemark] = useState<string>("");

  const form = useForm({
    initialValues: {
      id: talent?.id || null,
      name: talent?.name || "",
      nameHeadline: talent?.nameHeadline || "",
      slug: talent?.slug || "",
      firstName: talent?.firstName || "",
      middleName: talent?.middleName || "",
      lastName: talent?.lastName || "",
      bigName: talent?.bigName || "FIRST",
      profileImgType: talent?.profileImgType || "NONE",
      profileImgURL: getTalentImageUrl(talent as TalentWithChannel) || null,
      age: talent?.age,
      birthDate: {
        hasBirthDate: talent?.timelines?.find((x) => x.type == "BIRTHDAY")
          ? true
          : false,
        year:
          talent?.timelines?.find((x) => x.type == "BIRTHDAY")?.year || null,
        month:
          talent?.timelines?.find((x) => x.type == "BIRTHDAY")?.month || null,
        day: talent?.timelines?.find((x) => x.type == "BIRTHDAY")?.day || null,
      },
      statusType: talent?.statusType || "ACTIVE",
      type: talent?.type || [],
      hashtags: talent?.hashtags || [],
      socials: talent?.socials || [],
      infos: talent?.infos || [],
      bio: talent?.bio || "",
      trivia: talent?.trivia || "",
      timelines: talent?.timelines?.filter((x) => x.type != "BIRTHDAY") || [],
      transfers:
        talent?.transfers?.map((x) => ({
          ...x,
          isAffiliate: x.affiliateId ? true : false,
        })) || [],
      youtubeMain: {
        id: -1,
        username: "",
        channelName: "",
        channelId: talent?.youtubeMain?.channelId || "",
        platform: "YOUTUBE",
        profileImgURL: "",
        subs: 0,
        views: 0,
        hasChannel: talent?.youtubeMain ? true : false,
      },
      twitchMain: {
        id: -1,
        username: talent?.twitchMain?.username || "",
        channelName: "",
        channelId: "",
        platform: "TWITCH",
        profileImgURL: "",
        subs: 0,
        views: 0,
        hasChannel: talent?.twitchMain ? true : false,
      },
    },

    validate: {
      name: (value) => (value.trim().length < 1 ? true : null),
      type: (value) => ((value?.length as number) < 1 || !value ? true : null),
      birthDate: {
        month: (value, values) => {
          if (values.birthDate.hasBirthDate && !value) {
            return true;
          }
          return null;
        },
        day: (value, values) => {
          if (values.birthDate.hasBirthDate && !value) {
            return true;
          }
          return null;
        },
      },
      socials: {
        text: (value) => ((value?.length as number) < 1 ? true : null),
        link: (value) => ((value?.length as number) < 1 ? true : null),
      },
      infos: {
        key: (value) => ((value?.length as number) < 1 ? true : null),
        value: (value) => ((value?.length as number) < 1 ? true : null),
      },
      hashtags: {
        text: (value) => ((value?.length as number) < 1 ? true : null),
        value: (value) => ((value?.length as number) < 1 ? true : null),
      },
      transfers: {
        affiliateId: (value, values, path) =>
          !value &&
          values.transfers.at(parseInt(path.split(".").at(1) || "0"))
            ?.isAffiliate
            ? `กรุณาเลือกสังกัด/กลุ่ม`
            : null,
        affiliateName: (value, values, path) =>
          !value?.length &&
          !values.transfers.at(parseInt(path.split(".").at(1) || "0"))
            ?.isAffiliate
            ? true
            : null,
      },
      timelines: {
        value: (value, values, path) =>
          !value &&
          values.timelines.at(parseInt(path.split(".").at(1) || "0"))?.type ==
            "OTHER"
            ? `กรุณาใส่ข้อมูล`
            : null,
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
      if (file && formData.profileImgType == "UPLOADED") {
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

      // formData
      (formData.slug = formData.slug || slugify(formData.name)),
        (formData.timelines = formData.timelines.map((item) => {
          let isAnniversary = true;
          switch (item.type) {
            case "INACTIVE":
            case "RETIRED":
              isAnniversary = false;
              break;
            default:
              break;
          }
          return {
            ...item,
            isAnniversary,
          };
        }));
      formData.nameHeadline = formData.nameHeadline || formData.name;
      if (!formData.id) {
        formData.firstName = formData.name;
      }
      return fetch("/api/talent", {
        body: JSON.stringify({ data: formData, token, remark }),
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
          type: "talent",
          talent_id: talent?.id || -1,
          talent_name: talent?.name || formData.name,
          talent_slug: talent?.slug || formData.slug,
          affiliate_id: -1,
          affiliate_name: null,
          affiliate_slug: null,
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
      form.setFieldValue("profileImgType", "UPLOADED");
    }
  }, [files]);

  const submitData = () => {
    const result = form.validate();
    if (result.hasErrors) {
      alertNotification("กรุณากรอกข้อมูลให้ครบถ้วน");
    } else {
      mutation.mutate({
        formData: form.values,
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
      title={talent ? "แก้ไขข้อมูล " + talent.name : "สร้างข้อมูลทาเล้นท์ใหม่"}
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
              label="ชื่อ"
              withAsterisk
              placeholder="กรุณาพิมพ์ชื่ออย่างน้อย 1 ตัวอักษร"
              {...form.getInputProps("name")}
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
                  fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
                />
                <div className="pt-2">(Max size : 2MB)</div>
              </div>
              <Button
                disabled={form.values?.profileImgURL ? false : true}
                onClick={() => {
                  setFiles([]);
                  form.setFieldValue("profileImgURL", "");
                  form.setFieldValue("profileImgType", "NONE");
                }}
                className="bg-primary disabled:opacity-50"
                variant="filled"
              >
                ลบรูป
              </Button>
            </div>
            <div className="p-3 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>ข้อมูล</span>
              <TextInput
                className="p-2 bg-white rounded"
                label="อายุ"
                placeholder="(ไม่บังคับ)"
                {...form.getInputProps("age")}
              />
              <Radio.Group
                label="สถานะ"
                className="p-2 bg-white rounded"
                {...form.getInputProps("statusType", { type: "input" })}
              >
                <Group mt="xs">
                  <Radio value="ACTIVE" label="ACTIVE" />
                  <Radio value="RETIRED" label="RETIRED" />
                  <Radio
                    value="INACTIVE_AS_VTUBER"
                    label="INACTIVE_AS_VTUBER"
                  />
                </Group>
              </Radio.Group>
              <div
                className={`p-2 bg-white rounded ${form.errors?.type ? "border-red-500 border-[2px]" : ""}`}
              >
                <Checkbox.Group
                  label="รูปแบบ"
                  required
                  {...form.getInputProps("type", { type: "input" })}
                >
                  <Group mt="xs">
                    <Checkbox value="TWO_D" key="TWO_D" label="2D" />
                    <Checkbox value="THREE_D" key="THREE_D" label="3D" />
                    <Checkbox value="PNG" key="PNG" label="PNG" />
                  </Group>
                </Checkbox.Group>
                {form.errors?.type && (
                  <div className="text-red-500 text-xs pt-2">
                    {form.errors?.type}
                  </div>
                )}
              </div>
              <div className={`p-2 bg-white rounded flex flex-col gap-2`}>
                <Checkbox
                  label="วันเกิด"
                  {...form.getInputProps("birthDate.hasBirthDate", {
                    type: "checkbox",
                  })}
                />
                <div className="flex ss:flex-row flex-col w-fit gap-2 items-top">
                  <NumberInput
                    disabled={!form.values.birthDate.hasBirthDate}
                    className=""
                    placeholder="ปี(ค.ศ.)"
                    {...form.getInputProps("birthDate.year")}
                  />
                  <Select
                    disabled={!form.values.birthDate.hasBirthDate}
                    placeholder="เดือน"
                    value={form.values.birthDate.month?.toString() || null}
                    onChange={(value) => {
                      form.setFieldValue(
                        "birthDate.month",
                        parseInt(value || "0") || null
                      );
                      if (
                        (dayInMonth.at(parseInt(value || "0")) || 0) <
                        (form.values.birthDate.day || 0)
                      ) {
                        form.setFieldValue(
                          "birthDate.day",
                          parseInt(value || "0") || null
                        );
                      }
                    }}
                    clearable={true}
                    withCheckIcon={false}
                    data={Info.months("long", { locale: "TH" }).map(
                      (label, index) => ({
                        value: (index + 1).toString(),
                        label,
                      })
                    )}
                    error={form.errors["birthDate.month"]}
                  />
                  <Select
                    disabled={!form.values.birthDate.hasBirthDate}
                    placeholder="วันที่"
                    value={form.values.birthDate.day?.toString() || null}
                    onChange={(value) =>
                      form.setFieldValue(
                        "birthDate.day",
                        parseInt(value || "0") || null
                      )
                    }
                    clearable={true}
                    withCheckIcon={false}
                    data={Array(dayInMonth.at(form.values.birthDate.month || 0))
                      .fill(0)
                      .map((value, index) => (index + 1).toString())}
                    error={form.errors["birthDate.day"]}
                  />
                </div>
              </div>
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
                      talentId: talent?.id || -1,
                      value: "",
                      link: "",
                      affiliateId: null,
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
            <div className="p-4 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>ประวัติ</span>
              <Editor {...form.getInputProps("bio")} />
            </div>
            <div className="p-4 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>เกร็ดข้อมูล</span>
              <Editor {...form.getInputProps("trivia")} />
            </div>
            <div className="p-3 bg-primary/20 flex flex-col text-sm rounded gap-4">
              <span>ไทมไลน์</span>
              {form.values.timelines.length > 0 && (
                <div className="grid gap-4">
                  {form.values.timelines.map((item, index) => (
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
                              "timelines",
                              reorder(form.values.timelines, index, index - 1)
                            )
                          }
                        >
                          <IconArrowUp stroke={2.5} />
                        </ActionIcon>
                        <ActionIcon
                          disabled={
                            index + 1 == form.values.timelines.length
                              ? true
                              : false
                          }
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "timelines",
                              reorder(form.values.timelines, index, index + 1)
                            )
                          }
                        >
                          <IconArrowDown stroke={2.5} />
                        </ActionIcon>
                      </div>
                      <div className="grid gap-2 flex-1">
                        <div className="flex flex-col gap-2">
                          <div className="flex ss:flex-row flex-col sm:w-fit w-full gap-2 items-center">
                            <Select
                              label="รูปแบบ"
                              value={item.type || ""}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "timelines." + index + ".type",
                                  value
                                )
                              }
                              allowDeselect={false}
                              withCheckIcon={false}
                              className="sm:w-36 w-full"
                              data={[
                                {
                                  value: "DEBUT",
                                  label: convertTimelineType("DEBUT")!,
                                },
                                {
                                  value: "REDEBUT",
                                  label: convertTimelineType("REDEBUT")!,
                                },
                                {
                                  value: "REMODEL",
                                  label: convertTimelineType("REMODEL")!,
                                },
                                {
                                  value: "REACTIVE",
                                  label: convertTimelineType("REACTIVE")!,
                                },
                                {
                                  value: "INACTIVE",
                                  label: convertTimelineType("INACTIVE")!,
                                },
                                {
                                  value: "RETIRED",
                                  label: convertTimelineType("RETIRED")!,
                                },
                                {
                                  value: "MOVE",
                                  label: convertTimelineType("MOVE")!,
                                },
                                {
                                  value: "NEWMODEL",
                                  label: convertTimelineType("NEWMODEL")!,
                                },
                                { value: "OTHER", label: "อื่นๆ" },
                              ]}
                            />
                          </div>
                          <div className="flex sm:flex-row flex-col sm:w-fit w-full gap-2 items-center">
                            <NumberInput
                              className="w-full sm:w-fit"
                              placeholder="ปี(ค.ศ.)"
                              value={item.year || ""}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "timelines." + index + ".year",
                                  value
                                )
                              }
                            />
                            <Select
                              className="w-full sm:w-fit"
                              placeholder="เดือน"
                              value={item.month?.toString() || null}
                              onChange={(value) => {
                                form.setFieldValue(
                                  "timelines." + index + ".month",
                                  parseInt(value || "0") || null
                                );
                                if (
                                  (dayInMonth.at(parseInt(value || "0")) || 0) <
                                  (item.day || 0)
                                ) {
                                  form.setFieldValue(
                                    "timelines." + index + ".day",
                                    null
                                  );
                                }
                              }}
                              clearable={true}
                              withCheckIcon={false}
                              data={Info.months("long", { locale: "TH" }).map(
                                (label, index) => ({
                                  value: (index + 1).toString(),
                                  label,
                                })
                              )}
                            />
                            <Select
                              className="w-full sm:w-fit"
                              placeholder="วันที่"
                              value={item.day?.toString() || null}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "timelines." + index + ".day",
                                  parseInt(value || "0") || null
                                )
                              }
                              clearable={true}
                              withCheckIcon={false}
                              data={Array(dayInMonth.at(item.month || 0))
                                .fill(0)
                                .map((value, index) => (index + 1).toString())}
                            />
                          </div>
                        </div>
                        <TextInput
                          className="flex-1"
                          error={form.errors["timelines." + index + ".value"]}
                          placeholder={`ข้อความเพิ่มเติม${item.type != "OTHER" ? " (ไม่บังคับ)" : ""}`}
                          value={item.value || ""}
                          onChange={(e) =>
                            form.setFieldValue(
                              "timelines." + index + ".value",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue(
                            "timelines",
                            removeItem(form.values.timelines, index)
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
                  form.setFieldValue("timelines", [
                    ...form.values.timelines,
                    {
                      id: -1,
                      talentId: talent?.id || -1,
                      value: "",
                      type: "OTHER",
                      day: null,
                      month: null,
                      year: null,
                      isAnniversary: true,
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
              <span>สังกัด/กลุ่ม</span>
              {form.values.transfers.length > 0 && (
                <div className="grid gap-4">
                  {form.values.transfers.map((item, index) => (
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
                              "transfers",
                              reorder(form.values.transfers, index, index - 1)
                            )
                          }
                        >
                          <IconArrowUp stroke={2.5} />
                        </ActionIcon>
                        <ActionIcon
                          disabled={
                            index + 1 == form.values.transfers.length
                              ? true
                              : false
                          }
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "transfers",
                              reorder(form.values.transfers, index, index + 1)
                            )
                          }
                        >
                          <IconArrowDown stroke={2.5} />
                        </ActionIcon>
                      </div>
                      <div className="flex flex-col flex-1 gap-2">
                        <div className="flex ss:flex-row flex-col w-full gap-2 items-center">
                          <Checkbox
                            label="เป็นสมาชิกปัจจุบัน?"
                            checked={item.isActive || false}
                            onChange={(e) =>
                              form.setFieldValue(
                                "transfers." + index + ".isActive",
                                e.target.checked
                              )
                            }
                          />
                        </div>
                        <div
                          className={`border-[2px] border-primary/40 rounded-xl p-2 gap-2 flex flex-col ${item.hasIn ? "" : "bg-primary/30"}`}
                        >
                          <Checkbox
                            label="วันที่เข้าสังกัด"
                            checked={item.hasIn || false}
                            onChange={(e) =>
                              form.setFieldValue(
                                "transfers." + index + ".hasIn",
                                e.target.checked
                              )
                            }
                          />
                          <div className="flex sm:flex-row flex-col sm:w-fit w-full gap-2 items-center">
                            <NumberInput
                              disabled={!item.hasIn || false}
                              className="sm:w-fit w-full"
                              placeholder="ปี(ค.ศ.)"
                              value={item.yearIn || ""}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "transfers." + index + ".yearIn",
                                  value
                                )
                              }
                            />
                            <Select
                              disabled={!item.hasIn || false}
                              placeholder="เดือน"
                              value={item.monthIn?.toString() || null}
                              onChange={(value) => {
                                form.setFieldValue(
                                  "transfers." + index + ".monthIn",
                                  parseInt(value || "0") || null
                                );
                                if (
                                  (dayInMonth.at(parseInt(value || "0")) || 0) <
                                  (item.dayIn || 0)
                                ) {
                                  form.setFieldValue(
                                    "transfers." + index + ".dayIn",
                                    null
                                  );
                                }
                              }}
                              className="sm:w-fit w-full"
                              clearable={true}
                              withCheckIcon={false}
                              data={Info.months("long", { locale: "TH" }).map(
                                (label, index) => ({
                                  value: (index + 1).toString(),
                                  label,
                                })
                              )}
                            />
                            <Select
                              className="sm:w-fit w-full"
                              disabled={!item.hasIn || false}
                              placeholder="วันที่"
                              value={item.dayIn?.toString() || null}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "transfers." + index + ".dayIn",
                                  parseInt(value || "0") || null
                                )
                              }
                              clearable={true}
                              withCheckIcon={false}
                              data={Array(dayInMonth.at(item.monthIn || 0))
                                .fill(0)
                                .map((value, index) => (index + 1).toString())}
                            />
                          </div>
                        </div>
                        <div
                          className={`border-[2px] border-primary/40 rounded-xl p-2 gap-2 flex flex-col ${item.hasOut ? "" : "bg-primary/30"}`}
                        >
                          <Checkbox
                            label="วันที่ออกสังกัด"
                            checked={item.hasOut || false}
                            onChange={(e) =>
                              form.setFieldValue(
                                "transfers." + index + ".hasOut",
                                e.target.checked
                              )
                            }
                          />
                          <div className="flex sm:flex-row flex-col sm:w-fit w-full gap-2 items-center">
                            <NumberInput
                              disabled={!item.hasOut || false}
                              className="sm:w-fit w-full"
                              placeholder="ปี(ค.ศ.)"
                              value={item.yearOut || ""}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "transfers." + index + ".yearOut",
                                  value
                                )
                              }
                            />
                            <Select
                              className="sm:w-fit w-full"
                              disabled={!item.hasOut || false}
                              placeholder="เดือน"
                              value={item.monthOut?.toString() || null}
                              onChange={(value) => {
                                form.setFieldValue(
                                  "transfers." + index + ".monthOut",
                                  parseInt(value || "0") || null
                                );
                                if (
                                  (dayInMonth.at(parseInt(value || "0")) || 0) <
                                  (item.dayOut || 0)
                                ) {
                                  form.setFieldValue(
                                    "transfers." + index + ".dayOut",
                                    null
                                  );
                                }
                              }}
                              clearable={true}
                              withCheckIcon={false}
                              data={Info.months("long", { locale: "TH" }).map(
                                (label, index) => ({
                                  value: (index + 1).toString(),
                                  label,
                                })
                              )}
                            />
                            <Select
                              className="sm:w-fit w-full"
                              disabled={!item.hasOut || false}
                              placeholder="วันที่"
                              value={item.dayOut?.toString() || null}
                              onChange={(value) =>
                                form.setFieldValue(
                                  "transfers." + index + ".dayOut",
                                  parseInt(value || "0") || null
                                )
                              }
                              clearable={true}
                              withCheckIcon={false}
                              data={Array(dayInMonth.at(item.monthOut || 0))
                                .fill(0)
                                .map((value, index) => (index + 1).toString())}
                            />
                          </div>
                        </div>
                        <div
                          className={`flex sm:flex-row flex-col w-full gap-2 items-center`}
                        >
                          <Switch
                            label="เป็นสังกัดในระบบ VTi หรือไม่?"
                            checked={item.isAffiliate || false}
                            onChange={(e) =>
                              form.setFieldValue(
                                "transfers." + index + ".isAffiliate",
                                e.target.checked
                              )
                            }
                          />
                          {item.isAffiliate && (
                            <AffiliateSingleSelect
                              affiliates={affiliates}
                              value={item.affiliateId?.toString() || ""}
                              onChange={(value) => {
                                form.setFieldValue(
                                  "transfers." + index + ".affiliateId",
                                  parseInt(value || "0") || null
                                );
                                form.setFieldError(
                                  "transfers." + index + ".affiliateId",
                                  null
                                );
                              }}
                            />
                          )}
                          {!item.isAffiliate && (
                            <TextInput
                              error={
                                form.errors[
                                  "transfers." + index + ".affiliateName"
                                ]
                              }
                              className="flex-1"
                              placeholder="ชื่อกลุ่ม/สังกัด"
                              value={item.affiliateName || ""}
                              onChange={(e) => {
                                form.setFieldValue(
                                  "transfers." + index + ".affiliateName",
                                  e.target.value
                                );
                                form.setFieldError(
                                  "transfers." + index + ".affiliateName",
                                  null
                                );
                              }}
                            />
                          )}
                          {form.errors["transfers." + index + ".affiliateId"] &&
                            item.isAffiliate && (
                              <div className="text-xs text-red-500">
                                {
                                  form.errors[
                                    "transfers." + index + ".affiliateId"
                                  ]
                                }
                              </div>
                            )}
                        </div>
                      </div>
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue(
                            "transfers",
                            removeItem(form.values.transfers, index)
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
                  form.setFieldValue("transfers", [
                    ...form.values.transfers,
                    {
                      id: -1,
                      talentId: talent?.id || -1,
                      type: "MEMBER",
                      affiliateId: null,
                      hasIn: null,
                      hasOut: null,
                      dayIn: null,
                      monthIn: null,
                      yearIn: null,
                      dayOut: null,
                      monthOut: null,
                      yearOut: null,
                      isActive: true,
                      typeString: null,
                      affiliateName: "",
                      isAffiliate: true,
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
              <span>แฮชแท็ค</span>
              {form.values.hashtags.length > 0 && (
                <div className="grid gap-4">
                  {form.values.hashtags.map((item, index) => (
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
                              "hashtags",
                              reorder(form.values.hashtags, index, index - 1)
                            )
                          }
                        >
                          <IconArrowUp stroke={2.5} />
                        </ActionIcon>
                        <ActionIcon
                          disabled={
                            index + 1 == form.values.hashtags.length
                              ? true
                              : false
                          }
                          variant="transparent"
                          onClick={() =>
                            form.setFieldValue(
                              "hashtags",
                              reorder(form.values.hashtags, index, index + 1)
                            )
                          }
                        >
                          <IconArrowDown stroke={2.5} />
                        </ActionIcon>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 flex-1">
                        <TextInput
                          error={form.errors["hashtags." + index + ".text"]}
                          placeholder="ข้อความ"
                          value={item.text || ""}
                          onChange={(e) => {
                            form.setFieldValue(
                              "hashtags." + index + ".text",
                              e.target.value
                            );
                          }}
                        />
                        <TextInput
                          error={form.errors["hashtags." + index + ".value"]}
                          classNames={{ section: "w-fit pl-2", input: "pl-6" }}
                          leftSectionPointerEvents="none"
                          leftSection={<IconHash size={16} />}
                          placeholder="แฮชแท็ค"
                          value={item.value || ""}
                          onChange={(e) => {
                            form.setFieldValue(
                              "hashtags." + index + ".value",
                              e.target.value
                            );
                          }}
                        />
                      </div>
                      <ActionIcon
                        onClick={() =>
                          form.setFieldValue(
                            "hashtags",
                            removeItem(form.values.hashtags, index)
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
                  form.setFieldValue("hashtags", [
                    ...form.values.hashtags,
                    {
                      id: -1,
                      text: "",
                      value: "",
                      talentId: talent?.id || -1,
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
              <div
                className={`flex flex-row gap-2 items-center p-2 rounded bg-red-500 text-white`}
              >
                <Checkbox
                  checked={form.values.youtubeMain.hasChannel}
                  onChange={(e) => {
                    form.setFieldValue("youtubeMain", {
                      id: -1,
                      username: "",
                      channelName: "",
                      channelId: "",
                      platform: "YOUTUBE",
                      profileImgURL: "",
                      subs: 0,
                      views: 0,
                      hasChannel: e.target.checked,
                    });
                    form.setFieldError("youtubeMain.channelId", null);
                  }}
                />
                <FontAwesomeIcon size="xl" icon={faYoutube} />
                <TextInput
                  classNames={{ error: "text-white" }}
                  error={form.errors["youtubeMain.channelId"]}
                  disabled={!form.values.youtubeMain.hasChannel}
                  className="flex-1"
                  placeholder="Channel ID"
                  value={form.values.youtubeMain?.channelId || ""}
                  onChange={(e) => {
                    form.setFieldValue("youtubeMain", {
                      id: -1,
                      username: "",
                      channelName: "",
                      channelId: e.target.value,
                      platform: "YOUTUBE",
                      profileImgURL: "",
                      subs: 0,
                      views: 0,
                      hasChannel: true,
                    });
                  }}
                />
              </div>
              <div
                className={`flex flex-row gap-2 items-center p-2 rounded bg-purple-500 text-white`}
              >
                <Checkbox
                  checked={form.values.twitchMain.hasChannel}
                  onChange={(e) => {
                    form.setFieldValue(
                      "twitchMain.hasChannel",
                      e.target.checked
                    );
                    if (!e.target.checked) {
                      form.setFieldValue("twitchMain.username", "");
                    }
                  }}
                />
                <FontAwesomeIcon size="xl" icon={faTwitch} />
                <TextInput
                  classNames={{ error: "text-white" }}
                  error={form.errors["twitchMain.username"]}
                  disabled={!form.values.twitchMain.hasChannel}
                  className="flex-1"
                  placeholder="Username"
                  value={form.values.twitchMain?.username || ""}
                  onChange={(e) =>
                    form.setFieldValue("twitchMain.username", e.target.value)
                  }
                />
              </div>
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
                          error={form.errors["socials." + index + ".text"]}
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
                          error={form.errors["socials." + index + ".link"]}
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
                      talentId: talent?.id || -1,
                      affiliateId: null,
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
              placeholder="(ไม่บังคับ)"
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
            onError={() => {
              setToken(null);
              setError(true);
            }}
            onExpire={() => refTurnsite.current?.reset()}
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
            loading={mutation.isLoading}
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
