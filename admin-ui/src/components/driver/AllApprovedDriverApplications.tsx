import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { AlertTriangle, ChevronDown, ChevronUp, Eye, Loader2, Search } from "lucide-react"
import { motion } from "framer-motion"
import { DriverRequestStatus, getAcceptedApplications, getPendingApplications } from "@/api/driver"
import { format } from "date-fns"

const AllApprovedDriverApplications = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "descending" })

  const {
    data: applications,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["driverApplicationsAccepted"],
    queryFn: getAcceptedApplications,
  })

  const sortedApplications = React.useMemo(() => {
    if (!applications) return []
    const sortableItems = [...applications]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [applications, sortConfig])

  const filteredApplications = React.useMemo(() => {
    return sortedApplications.filter(
      (application) =>
        application.nic_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.user_id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [sortedApplications, searchTerm])

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString
      return format(date, "PP")
    } catch (e) {
      return "Invalid date"
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-4 w-4 opacity-30 hover:opacity-100" />
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-slate-50">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-800 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-700 hover:bg-slate-700/50"
            onClick={() => navigate(-1)}
          >
            <ChevronUp className="h-4 w-4 mr-2 rotate-90" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-100">Approved Driver Applications</h1>
        </div>
        <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-700 bg-slate-900 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
          <p className="ml-3 text-lg text-slate-300">Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-800 p-6 rounded-lg shadow-lg">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong.</h3>
          <p className="text-slate-400 mb-1">We couldn't load the driver applications data.</p>
          <p className="text-xs text-slate-500">Error: {error?.message || "Unknown error"}</p>
          <Button
            onClick={() => queryClient.refetchQueries({ queryKey: ["driverApplications"] })}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Table Display */}
      {!isLoading && !isError && applications && (
        <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg">
          <Table className="min-w-full">
            <TableCaption className="py-4 text-sm text-slate-400">
              A list of all approved driver applications.{" "}
              {filteredApplications.length > 0
                ? `Showing ${filteredApplications.length} of ${applications.length} total.`
                : "No applications match your criteria."}
            </TableCaption>
            <TableHeader className="bg-slate-700/50">
              <TableRow className="border-b border-slate-700">
                {[
                  { label: "NIC No", key: "nic_no" },
                  { label: "Vehicle Number", key: "vehicle_number" },
                  { label: "Vehicle Type", key: "vehicle_type" },
                  { label: "Approved Date", key: "updated_at" },
                  { label: "Actions", key: "actions" },
                ].map((header) => (
                  <TableHead
                    key={header.key}
                    className={`px-4 py-3.5 text-left text-xs font-medium text-slate-300 uppercase tracking-wider ${["nic_no", "vehicle_number", "updated_at"].includes(header.key) ? "cursor-pointer hover:bg-slate-600/50 transition-colors" : ""}`}
                    onClick={() =>
                      ["nic_no", "vehicle_number", "updated_at"].includes(header.key) &&
                      requestSort(header.key)
                    }
                  >
                    <div className="flex items-center gap-1">
                      {header.label}
                      {["nic_no", "vehicle_number", "updated_at"].includes(header.key) &&
                        getSortIcon(header.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-700">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application, index) => (
                  <motion.tr
                    key={application.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="hover:bg-slate-700/30 transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">{application.nic_no}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                      {application.vehicle_number}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                      {application.vehicle_type.charAt(0).toUpperCase() + application.vehicle_type.slice(1)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                      {formatDate(application.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sky-400 border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 hover:scale-[1.3]"
                          onClick={() => navigate(`/dashboard/driver-application/${application.id}`)}
                          title="View Application"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-slate-500 mb-3" />
                      <p className="text-lg font-medium text-slate-300">No Approved Applications Found</p>
                      <p className="text-sm text-slate-400">
                        {searchTerm
                          ? "Try adjusting your search criteria."
                          : "There are no approved driver applications to display yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default AllApprovedDriverApplications
