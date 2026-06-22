<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { getPageNumbers } from '@/common/utils/pagination'

interface Pagination {
  pageNo: number
  pageSize: number
  total: number
}

export default defineComponent({
  name: 'DataTablePagination',
  props: {
    pagination: {
      type: Object as PropType<Pagination>,
      required: true
    },
    onPageChange: {
      type: Function as PropType<(page: number) => void>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const totalPages = Math.ceil(props.pagination.total / props.pagination.pageSize)
      const pageNumbers = getPageNumbers(props.pagination.pageNo, totalPages)

      return (
        <div
          class={cn(
            'flex items-center justify-between overflow-clip px-2',
            '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4'
          )}
          style={{ overflowClipMargin: '1px' }}
        >
          {/* <div class="flex w-full items-center justify-between"></div> */}

          <div class="flex items-center sm:space-x-6 lg:space-x-8">
            {/* <div class="flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden"></div> */}

            <div class="flex items-center space-x-2">
              {/* 上一页按钮 */}
              <Button
                variant="outline"
                class="size-8 p-0"
                disabled={props.pagination.pageNo === 1}
                onClick={() => props.onPageChange(props.pagination.pageNo - 1)}
              >
                <ChevronLeftIcon class="h-4 w-4" />
              </Button>

              {/* 页码 */}
              {pageNumbers.map((pageNumber, index) => (
                <div key={`${pageNumber}-${index}`} class="flex items-center">
                  {pageNumber === '...' ? (
                    <span class="text-muted-foreground px-1 text-sm">...</span>
                  ) : (
                    <Button
                      variant={props.pagination.pageNo === pageNumber ? 'default' : 'outline'}
                      class="h-8 min-w-8 px-2"
                      onClick={() => props.onPageChange(pageNumber as number)}
                    >
                      <span class="sr-only">Go to page {pageNumber}</span>
                      {pageNumber}
                    </Button>
                  )}
                </div>
              ))}

              {/* 下一页按钮 */}
              <Button
                variant="outline"
                class="size-8 p-0"
                disabled={props.pagination.pageNo === totalPages}
                onClick={() => props.onPageChange(props.pagination.pageNo + 1)}
              >
                <ChevronRightIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }
})
</script>