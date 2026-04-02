"use client";

import { Shadcn } from "@/components";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export function SectionCards() {
    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Shadcn.Card className="@container/card">
                <Shadcn.CardHeader>
                    <Shadcn.CardDescription>Total Revenue</Shadcn.CardDescription>
                    <Shadcn.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">$1,250.00</Shadcn.CardTitle>
                    <Shadcn.CardAction>
                        <Shadcn.Badge variant="outline">
                            <TrendingUpIcon />
                            +12.5%
                        </Shadcn.Badge>
                    </Shadcn.CardAction>
                </Shadcn.CardHeader>
                <Shadcn.CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Visitors for the last 6 months</div>
                </Shadcn.CardFooter>
            </Shadcn.Card>
            <Shadcn.Card className="@container/card">
                <Shadcn.CardHeader>
                    <Shadcn.CardDescription>New Customers</Shadcn.CardDescription>
                    <Shadcn.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">1,234</Shadcn.CardTitle>
                    <Shadcn.CardAction>
                        <Shadcn.Badge variant="outline">
                            <TrendingDownIcon />
                            -20%
                        </Shadcn.Badge>
                    </Shadcn.CardAction>
                </Shadcn.CardHeader>
                <Shadcn.CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Down 20% this period <TrendingDownIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Acquisition needs attention</div>
                </Shadcn.CardFooter>
            </Shadcn.Card>
            <Shadcn.Card className="@container/card">
                <Shadcn.CardHeader>
                    <Shadcn.CardDescription>Active Accounts</Shadcn.CardDescription>
                    <Shadcn.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">45,678</Shadcn.CardTitle>
                    <Shadcn.CardAction>
                        <Shadcn.Badge variant="outline">
                            <TrendingUpIcon />
                            +12.5%
                        </Shadcn.Badge>
                    </Shadcn.CardAction>
                </Shadcn.CardHeader>
                <Shadcn.CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Strong user retention <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Engagement exceed targets</div>
                </Shadcn.CardFooter>
            </Shadcn.Card>
            <Shadcn.Card className="@container/card">
                <Shadcn.CardHeader>
                    <Shadcn.CardDescription>Growth Rate</Shadcn.CardDescription>
                    <Shadcn.CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4.5%</Shadcn.CardTitle>
                    <Shadcn.CardAction>
                        <Shadcn.Badge variant="outline">
                            <TrendingUpIcon />
                            +4.5%
                        </Shadcn.Badge>
                    </Shadcn.CardAction>
                </Shadcn.CardHeader>
                <Shadcn.CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Steady performance increase <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Meets growth projections</div>
                </Shadcn.CardFooter>
            </Shadcn.Card>
        </div>
    );
}
