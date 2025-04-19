// 'use client'
// import { Combobox } from '@/components/combobox'
// import { MdEditor } from '@/components/md-editor'
// import { Switcher } from '@/components/switcher'
// import { Input } from '@/components/ui/input'
// import {
//   CAR_ENERGY_TYPES,
//   CLAMPING_TYPES,
//   COLLECTOR_MATERIALS_TYPES,
//   COLLECTOR_POSITION_TYPES,
//   COOLING_SYSTEMS_TYPES,
//   FABRICATION_TYPES,
//   FINS_TYPES,
//   ORDER_TYPES,
//   PACKAGING_TYPES,
//   PERFORATION_TYPES,
//   TUBE_TYPES
// } from '@/config/global'
// import {
//   componentValidationSchema,
//   ComponentValidationSchema
// } from '@/lib/validations/order'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useRouter } from 'next/navigation'
// import React from 'react'
// import { useForm } from 'react-hook-form'
// import { CardGrid } from '@/components/card'
// import { useOrder } from '@/components/new-order.provider'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form'
// import { Separator } from '@/components/ui/separator'
// import { useMutation, useQuery } from '@tanstack/react-query'
// import { genTitle } from '@/lib/order-title-generator'
// import { delay } from '@/lib/utils'
// import { Icons } from '@/components/icons'
// import Link from 'next/link'

// interface Props {
//   data?: ComponentValidationSchema
// }

// export const ComponentTechnicalForm: React.FC<Props> = ({ data }: Props) => {
//   const [isCollectorsDifferent, setIsCollectorsDifferent] =
//     React.useState(false)
//   const router = useRouter()
//   const form = useForm<ComponentValidationSchema>({
//     // defaultValues: data,
//     defaultValues: {
//       type: 'Radiateur',
//       fabrication: 'Confection',
//       cooling: 'Eau',
//       packaging: 'Carton',
//       quantity: 1,
//       isModificationIncluded: false,
//       core: {
//         fins: 'Droite (Normale)',
//         finsPitch: 10,
//         tube: 'Étiré 7 (ET7)',
//         collector: {
//           isTinned: false,
//           tightening: 'Perforé',
//           cooling: 'Plié',
//           position: 'Centrer',
//           material: 'Laiton',
//           dimensions: {
//             upper: {
//               thickness: 1.5
//             }
//           }
//         }
//       }
//     },
//     resolver: zodResolver(componentValidationSchema)
//   })
//   const isModificationRequired = form.watch('isModificationRequired')
//   const type = form.watch('type')
//   const collectorType = form.watch('core.collector.type')
//   const tubePitch = form.watch('core.tubePitch')
//   const fins = form.watch('core.fins')
//   const coolingSystem = form.watch('coolingSystem')
//   const depth = form.watch('core.collector.dimensions.upper.depth')
//   const length = form.watch('core.collector.dimensions.upper.length')
//   const width = form.watch('core.collector.dimensions.upper.width')
//   const [isLoading, updateOrderMetadata] = React.useTransition()

//   const onSubmit = (formData: ComponentValidationSchema) => {
//     // update data using react query
//     updateOrderMetadata(async () => {
//       await delay(1500)
//     })
//   }

//   React.useEffect(() => {
//     if (isCollectorsDifferent)
//       form.setValue('core.collector.dimensions.lower', {
//         thickness: depth,
//         width,
//         height: length
//       })
//     else form.setValue('core.collector.dimensions.lower', undefined)
//   }, [isCollectorsDifferent])

//   return (
//     <Form {...form}>
//       <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
//         <div className="relative border rounded-md px-3 py-3">
//           <div className="flex items-center justify-between select-none">
//             <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
//               Véhicule
//             </span>
//             <Link
//               href={`/dashboard/cars/vex5d7g9h`}
//               className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
//             >
//               {'vex5d7g9h'.toUpperCase()}
//             </Link>
//           </div>
//           <CardGrid>
//             <FormField
//               control={form.control}
//               name="car.manufacture"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Marque'}</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="w-full" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="car.car"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Véhicule'}</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="w-full" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="car.model"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Modèle'}</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="w-full" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="car.fuel"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'énergie'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       id="fuel"
//                       options={CAR_ENERGY_TYPES}
//                       onSelect={(v) => form.setValue('car.fuel', v)}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="car.year"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'année'}</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="w-full" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </CardGrid>
//         </div>
//         <div className="relative border rounded-md px-3 py-3">
//           <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
//             commande
//           </span>
//           <CardGrid>
//             <FormField
//               control={form.control}
//               name="isModificationRequired"
//               render={({ field }) => (
//                 <FormItem className="group md:col-span-2 lg:col-span-3 ">
//                   <FormLabel className="capitalize">
//                     {' '}
//                     {'Nécessite une modification'}
//                   </FormLabel>
//                   <FormControl>
//                     <Switcher
//                       id="isModificationRequired"
//                       checked={isModificationRequired as boolean}
//                       onCheckedChange={(v) => {
//                         form.setValue('isModificationRequired', v)
//                       }}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             {isModificationRequired && (
//               <FormField
//                 control={form.control}
//                 name="modification"
//                 render={({ field }) => (
//                   <FormItem className="group md:col-span-2 lg:col-span-3 ">
//                     <FormLabel className="capitalize">
//                       {'Les Modifications'}
//                     </FormLabel>
//                     <FormControl>
//                       <MdEditor
//                         editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
//                         className="w-full min-h-36 group"
//                         placeholder="Listez les changements à effectuer..."
//                         value={field.value}
//                         setValue={(markdown) => {
//                           form.setValue('modification', markdown)
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="type"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Type'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       id="type"
//                       options={ORDER_TYPES}
//                       onSelect={(v) => {
//                         if (v == 'Faisceau')
//                           form.setValue('fabrication', 'Confection')
//                         form.setValue('type', v)
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="fabrication"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Fabrication'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       id="fabrication"
//                       options={
//                         type === 'Faisceau'
//                           ? FABRICATION_TYPES.filter((i) => i == 'Confection')
//                           : FABRICATION_TYPES
//                       }
//                       onSelect={(v) => {
//                         form.setValue('fabrication', v)
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="quantity"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Quantité'}</FormLabel>
//                   <FormControl>
//                     <Input {...field} type="number" className="w-full" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="coolingSystem"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">
//                     {'Refroidissement'}
//                   </FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       options={COOLING_SYSTEMS_TYPES}
//                       onSelect={(v) => {
//                         form.setValue('coolingSystem', v)
//                         if (v != 'Eau')
//                           form.setValue('core.collector.type', 'Plié')
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="packaging"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Emballage'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       id="packaging"
//                       options={PACKAGING_TYPES}
//                       onSelect={(v) => {
//                         form.setValue('packaging', v)
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {type == 'Autre' && (
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="group md:col-span-2 lg:col-span-3">
//                     <FormLabel className="capitalize">
//                       {'Description'}
//                     </FormLabel>
//                     <FormControl>
//                       <MdEditor
//                         editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
//                         className="w-full min-h-36 group"
//                         placeholder="Décrivez ce que vous souhaitez..."
//                         setValue={(markdown) => {
//                           form.setValue('description', markdown)
//                         }}
//                         value={field.value}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
//           </CardGrid>
//         </div>

//         <div className="relative space-y-3 border rounded-md px-3 py-3 ">
//           <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
//             faisceau
//           </span>
//           <CardGrid className="">
//             <FormField
//               control={form.control}
//               name="core.length"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">
//                     {'Longueur'}
//                     <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                       {'(mm)'}
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="number"
//                       onChange={({ target: { value } }) =>
//                         form.setValue('core.length', Number(value))
//                       }
//                       className="w-full"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="core.width"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">
//                     {'Largeur'}
//                     <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                       {'(mm)'}
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       {...field}
//                       onChange={({ target: { value } }) =>
//                         form.setValue('core.width', Number(value))
//                       }
//                       className="w-full"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="core.layers"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">
//                     {'Nombre De Rangées (N°R)'}
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       {...field}
//                       onChange={({ target: { value } }) =>
//                         form.setValue('core.layers', Number(value))
//                       }
//                       className="w-full"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </CardGrid>
//           <CardGrid>
//             <FormField
//               control={form.control}
//               name="core.fins"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Ailette'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       options={FINS_TYPES}
//                       onSelect={(v) => {
//                         if (
//                           (v === 'Zigzag' && tubePitch === 11) ||
//                           ((v === 'Droite (Aérer)' ||
//                             v === 'Droite (Normale)') &&
//                             tubePitch === 12)
//                         )
//                           form.setValue('core.tubePitch', 10)
//                         form.setValue('core.fins', v)
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="core.tube"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">{'Tube'}</FormLabel>
//                   <FormControl>
//                     <Combobox
//                       id="tube"
//                       options={TUBE_TYPES}
//                       onSelect={(v) => {
//                         form.setValue('core.tube', v)
//                       }}
//                       selected={field.value}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="core.tubePitch"
//               render={({ field }) => (
//                 <FormItem className="group ">
//                   <FormLabel className="capitalize">
//                     {'Pas Des Tubes'}
//                   </FormLabel>
//                   <FormControl>
//                     <Combobox
//                       {...field}
//                       options={
//                         fins == 'Zigzag' ? ['10', '12'] : ['10', '11', '14']
//                       }
//                       onSelect={(v) => {
//                         form.setValue('core.tubePitch', Number(v))
//                       }}
//                       selected={field.value?.toString()}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </CardGrid>
//           <div className="pt-5">
//             <div className="relative space-y-3 border rounded-md px-3 py-3">
//               <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
//                 collecteurs
//               </span>

//               <CardGrid>
//                 <FormField
//                   control={form.control}
//                   name="core.collector.isTinned"
//                   render={({ field }) => (
//                     <FormItem className="w-full md:col-span-2 lg:col-span-3 ">
//                       <FormLabel className="capitalize">{'Étamé'}</FormLabel>
//                       <FormControl>
//                         <Switcher
//                           {...field}
//                           checked={field.value as boolean}
//                           onCheckedChange={(v) =>
//                             form.setValue('core.collector.isTinned', v)
//                           }
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="core.collector.material"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">{'Matière'}</FormLabel>
//                       <FormControl>
//                         <Combobox
//                           options={COLLECTOR_MATERIALS_TYPES}
//                           onSelect={(v) =>
//                             form.setValue('core.collector.material', v)
//                           }
//                           selected={field.value}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="core.collector.type"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">{'Serrage'}</FormLabel>
//                       <FormControl>
//                         <Combobox
//                           options={
//                             ['Air', 'Huile'].includes(coolingSystem)
//                               ? ['Plié']
//                               : CLAMPING_TYPES
//                           }
//                           onSelect={(v) =>
//                             form.setValue('core.collector.type', v)
//                           }
//                           selected={field.value}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 {collectorType == 'Boulonné' && (
//                   <FormField
//                     control={form.control}
//                     name="core.collector.perforation"
//                     render={({ field }) => (
//                       <FormItem className="group ">
//                         <FormLabel className="capitalize">
//                           {'Perforation'}
//                         </FormLabel>
//                         <FormControl>
//                           <Combobox
//                             id="perforation"
//                             options={PERFORATION_TYPES}
//                             onSelect={(v) => {
//                               form.setValue('core.collector.perforation', v)
//                             }}
//                             selected={field.value}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}
//                 <FormField
//                   control={form.control}
//                   name="core.collector.position"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">
//                         {'Positionnement'}
//                       </FormLabel>
//                       <FormControl>
//                         <Combobox
//                           options={COLLECTOR_POSITION_TYPES}
//                           onSelect={(v) => {
//                             form.setValue('core.collector.position', v)
//                           }}
//                           selected={field.value}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </CardGrid>
//               <div className="pt-2">
//                 <span className="text-xs text-muted-foreground/50 uppercase ">
//                   {!isCollectorsDifferent
//                     ? 'Dimensions (Haut/Bas)'
//                     : 'Dimensions (Haut)'}
//                 </span>
//               </div>
//               <CardGrid>
//                 <FormField
//                   control={form.control}
//                   name="core.collector.dimensions.upper.length"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">
//                         {'Longueur'}
//                         <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                           {'(mm)'}
//                         </span>
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           {...field}
//                           onChange={({ target: { value } }) =>
//                             form.setValue(
//                               'core.collector.dimensions.upper.length',
//                               Number(value)
//                             )
//                           }
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="core.collector.dimensions.upper.width"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">
//                         {'Largeur'}
//                         <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                           {'(mm)'}
//                         </span>
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           {...field}
//                           onChange={({ target: { value } }) =>
//                             form.setValue(
//                               'core.collector.dimensions.upper.width',
//                               Number(value)
//                             )
//                           }
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="core.collector.dimensions.upper.depth"
//                   render={({ field }) => (
//                     <FormItem className="group ">
//                       <FormLabel className="capitalize">
//                         {'Épaisseur'}
//                         <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                           {'(mm)'}
//                         </span>
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           {...field}
//                           onChange={({ target: { value } }) =>
//                             form.setValue(
//                               'core.collector.dimensions.upper.depth',
//                               Number(value)
//                             )
//                           }
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </CardGrid>
//               {isCollectorsDifferent && (
//                 <>
//                   <div className="pt-2">
//                     <span className="text-xs text-muted-foreground/50 uppercase ">
//                       {'Dimensions (Bas)'}
//                     </span>
//                   </div>
//                   <CardGrid>
//                     <FormField
//                       control={form.control}
//                       name="core.collector.dimensions.lower.length"
//                       render={({ field }) => (
//                         <FormItem className="group ">
//                           <FormLabel className="capitalize">
//                             {'Longueur'}
//                             <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                               {'(mm)'}
//                             </span>
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               {...field}
//                               onChange={({ target: { value } }) =>
//                                 form.setValue(
//                                   'core.collector.dimensions.lower.length',
//                                   Number(value)
//                                 )
//                               }
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="core.collector.dimensions.lower.width"
//                       render={({ field }) => (
//                         <FormItem className="group ">
//                           <FormLabel className="capitalize">
//                             {'Largeur'}
//                             <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                               {'(mm)'}
//                             </span>
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               {...field}
//                               onChange={({ target: { value } }) =>
//                                 form.setValue(
//                                   'core.collector.dimensions.lower.width',
//                                   Number(value)
//                                 )
//                               }
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="core.collector.dimensions.lower.depth"
//                       render={({ field }) => (
//                         <FormItem className="group ">
//                           <FormLabel className="capitalize">
//                             {'Épaisseur'}
//                             <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
//                               {'(mm)'}
//                             </span>
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               {...field}
//                               onChange={({ target: { value } }) =>
//                                 form.setValue(
//                                   'core.collector.dimensions.lower.depth',
//                                   Number(value)
//                                 )
//                               }
//                               disabled={collectorType == 'Boulonné'}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardGrid>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col items-end gap-4">
//           <Separator />
//           <Button className="w-fit flex gap-1" type="submit">
//             <span>{'Modifier'}</span>
//             {isLoading && (
//               <Icons.spinner className=" w-auto h-5 animate-spin" />
//             )}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   )
// }
