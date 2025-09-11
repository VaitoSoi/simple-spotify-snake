import type { ComponentProps } from "react";
import SnakeIcon from '@/icons/Snake.svg';
import SnakeHuhIcon from '@/icons/SnakeHuh.svg';

export function Snake (props: ComponentProps<"img">) {
    return <img src={SnakeIcon} {...props} />;
}

export function SnakeHuh (props: ComponentProps<"img">) {
    return <img src={SnakeHuhIcon} {...props} />;
}