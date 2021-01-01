import { Express } from "express";

interface Props {
  app: Express;
}

export type RestApi = ({ app }: Props) => void;
