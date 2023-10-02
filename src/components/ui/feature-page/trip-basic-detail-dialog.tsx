import { useCallback } from "react";

import { Button } from "../button";
import {
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogDescription,
} from "../dialog";

import { useToast } from "../use-toast";
import { Input } from "../input";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { Checkbox } from "../checkbox";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import {
  ActivityTypes,
  TripWith,
} from "../../../lib/constants/firebase.constants";

import {
  TripBasicDetailsDialogForm,
  cityBuilderModalSchema,
} from "../../../lib/schema/city-builder-form.schema";

interface ITripBasicDetailsDialogProps {
  isOpen: boolean;
  placeName: string;
  placeId: string;
  onSuccess: (data: TripBasicDetailsDialogForm) => void;
}

const keyMapper = <T,>(key: T) => ({ id: key, value: key });

const tripWithOptions = Object.values(TripWith).map(keyMapper);

const ActivityTypesOptions = Object.values(ActivityTypes).map(keyMapper);

export function TripBasicDetailsDialog(props: ITripBasicDetailsDialogProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: yupResolver(cityBuilderModalSchema),
    defaultValues: {
      placeId: props?.placeId,
      days: 1,
      additionalInformation: "",
      tripWith: TripWith.Solo,
      activityTypes: new Array<ActivityTypes>(),
    },
  });
  const onSubmit = useCallback(() => {
    cityBuilderModalSchema
      .validate(form.getValues())
      .then(() => {
        props?.onSuccess(form.getValues());
      })
      .catch((error) => {
        toast({
          title: "Invalid data enter!",
          description: (
            <ol>
              {error?.errors?.map((message: string) => (
                <ul key={message}>{message}</ul>
              ))}
            </ol>
          ),
          variant: "destructive",
        });
      });
  }, [form, props, toast]);

  return (
    <Dialog open={props.isOpen} modal={true}>
      <DialogContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                Let&apos;s get some basic information about your trip.
              </DialogTitle>
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <DialogDescription className="flex flex-wrap items-center mt-4 tracking-tight">
                      I&apos;m planning to visit {props.placeName} for{" "}
                      <FormControl>
                        <Input
                          id="days"
                          type="number"
                          max={14}
                          min={1}
                          required={true}
                          className="w-16 mx-2"
                          {...field}
                        />
                      </FormControl>
                      {"  "}
                      days.
                      <FormMessage />
                    </DialogDescription>
                  </FormItem>
                )}
              />
            </DialogHeader>
            {/* <FormField
              control={form.control}
              name="tripWith"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Who’s coming with you?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-3 w-full justify-between"
                      name="tripWith"
                    >
                      {tripWithOptions.map((item) => {
                        return (
                          <FormItem
                            className="flex items-center space-x-3 space-y-0"
                            key={item.id}
                          >
                            <FormControl>
                              <RadioGroupItem value={item.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.id}
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityTypes"
              render={() => (
                <FormItem className="space-y-3">
                  <FormLabel>How do you want to spend your time?</FormLabel>
                  {ActivityTypesOptions.map((item) => {
                    return (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="activityTypes"
                        render={({ field }) => (
                          <FormItem
                            className="flex flex-row items-start space-x-3 space-y-0"
                            key={item.id}
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        item.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.id}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name="additionalInformation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Here&apos;s some information about my trip:
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional Information (Optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <DialogFooter>
              <Button type="submit" onClick={onSubmit}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
TripBasicDetailsDialog.displayName = "TripBasicDetailsDialog";
