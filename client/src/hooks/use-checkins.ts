import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCheckinRequest, type CompleteCheckinRequest, type CheckinResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/checkins/last
export function useLastCheckin() {
  return useQuery({
    queryKey: [api.checkins.getLast.path],
    queryFn: async () => {
      const res = await fetch(api.checkins.getLast.path, { credentials: "include" });
      if (res.status === 401) return null; 
      if (!res.ok) throw new Error("Failed to fetch last check-in");
      
      const data = await res.json();
      // Handle optional response
      if (!data) return null;
      return api.checkins.getLast.responses[200].parse(data);
    },
    retry: false,
  });
}

// POST /api/checkins
export function useCreateCheckin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCheckinRequest) => {
      const res = await fetch(api.checkins.create.path, {
        method: api.checkins.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to create check-in");
      }

      return api.checkins.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.checkins.getLast.path], data);
      queryClient.invalidateQueries({ queryKey: [api.checkins.list.path] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// PATCH /api/checkins/:id/complete
export function useCompleteCheckin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & CompleteCheckinRequest) => {
      const url = buildUrl(api.checkins.complete.path, { id });
      const res = await fetch(url, {
        method: api.checkins.complete.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to complete check-in");
      }

      return api.checkins.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.checkins.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.checkins.getLast.path] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
