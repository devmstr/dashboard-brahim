// 'use client'
// import { CardGrid } from '@/components/card'
// import { Switcher } from '@/components/switcher'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { delay } from '@/lib/utils'
// import {
//   componentValidationSchema,
//   ComponentValidationSchema
// } from '@/lib/validations/order'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useRouter } from 'next/navigation'
// import React from 'react'
// import { useForm } from 'react-hook-form'

// interface Props {
//   data?: ComponentValidationSchema
// }

// export const ComponentProductionForm: React.FC<Props> = ({ data }: Props) => {
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
//         tube: 'Étiré 7 (ET7)'
//       },
//       collector: {
//         isTinned: false,
//         tightening: 'Plié',
//         perforation: 'Perforé',
//         position: 'Centrer',
//         material: 'Laiton',
//         upperDimensions: {
//           thickness: 1.5
//         }
//       }
//     },
//     resolver: zodResolver(componentValidationSchema)
//   })
//   const isModificationIncluded = form.watch('isModificationIncluded')
//   const type = form.watch('type')
//   const collectorType = form.watch('core.collector.')
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
//                       type="number"
//                       {...field}
//                       onChange={undefined}
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
//                       {...field}
//                       onChange={undefined}
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
//                       onChange={undefined}
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
//                     <Input {...field} onChange={undefined} />
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
//                     <Input {...field} onChange={undefined} />
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
//                     <Input {...field} onChange={undefined} />
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
//                           onCheckedChange={(v) => undefined}
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
//                         <Input {...field} onChange={undefined} />
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
//                         <Input {...field} onChange={undefined} />
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
//                           <Input {...field} onChange={undefined} />
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
//                         <Input {...field} onChange={undefined} />
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
//                         <Input type="number" {...field} onChange={undefined} />
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
//                         <Input type="number" {...field} onChange={undefined} />
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
//                         <Input type="number" {...field} onChange={undefined} />
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
//                               onChange={undefined}
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
//                               onChange={undefined}
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
//                               onChange={undefined}
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
//       </form>
//     </Form>
//   )
// }
