import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


export interface TabData {
    value: string;
    label: string;
    content: React.ReactNode;
}

export interface DynamicTabsProps {
    tabData: TabData[];
    className?: string;
}

const DynamicTabs: React.FC<DynamicTabsProps> = ({ tabData, className = "w-full flex justify-center my-5" }) => {
    const defaultTab = tabData.length > 0 ? tabData[0].value : '';

    return (
        <Tabs defaultValue={defaultTab} className={className}>
            <TabsList className='mx-auto'>
                {tabData.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabData.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default DynamicTabs;